import Stripe from "stripe";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

let stripeInstance: Stripe | null = null;
const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const key = env.stripeSecretKey;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured in environment variables.");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeInstance;
};

export const PaymentsService = {
  createCheckoutSession: async (orderData: any, userId: string) => {
    // 1. Fetch meals from DB to prevent client-side price tampering
    const mealIds = orderData.orderItems.map((item: any) => item.mealId);
    const dbMeals = await prisma.meal.findMany({
      where: { id: { in: mealIds } },
      include: { provider: true },
    });

    if (dbMeals.length === 0) {
      throw new Error("No valid meals found");
    }

    const providerId = dbMeals[0]!.providerId;

    const secureOrderItems = orderData.orderItems.map((item: any) => {
      const dbMeal = dbMeals.find((m) => m.id === item.mealId);
      if (!dbMeal) throw new Error(`Meal ${item.mealId} not found`);
      return {
        mealId: item.mealId,
        quantity: item.quantity,
        price: dbMeal.price,
        name: dbMeal.name,
        image: dbMeal.image,
      };
    });

    const totalPrice = secureOrderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const paymentMethod = orderData.paymentMethod === "COD" ? "COD" : "STRIPE";

    // 2. Create the PENDING order in the database first
    const order = await prisma.order.create({
      data: {
        delivaryAddress: orderData.delivaryAddress,
        longitude: orderData.longitude ?? null,
        latitude: orderData.latitude ?? null,
        totalPrice: totalPrice + 5.0, // Add flat $5.00 delivery fee
        customerId: userId,
        providerId: providerId,
        paymentStatus: "PENDING",
        paymentMethod: paymentMethod,
        status: "PLACED",
        orderItems: {
          create: secureOrderItems.map((item: any) => ({
            price: item.price,
            quantity: item.quantity,
            mealId: item.mealId,
          })),
        },
      },
    });

    if (paymentMethod === "COD") {
      return { orderId: order.id };
    }

    // 3. Prepare Stripe Line Items (amounts must be in cents)
    const lineItems = secureOrderItems.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add flat $5.00 delivery fee
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee",
        },
        unit_amount: 500,
      },
      quantity: 1,
    });

    // 4. Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${env.appUrl}/cart/success?orderId=${order.id}`,
      cancel_url: `${env.appUrl}/cart/cancel`,
      metadata: {
        orderId: order.id,
        userId: userId,
      },
    });

    return { url: session.url || "" };
  },

  handleWebhook: async (rawBody: Buffer, signature: string) => {
    let event: any;

    try {
      event = getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        env.stripeWebhookSecret || ""
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      const transactionId = session.payment_intent as string;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            transactionId: transactionId,
          },
        });
        console.log(`Order ${orderId} successfully paid.`);
      }
    }
  },
};
