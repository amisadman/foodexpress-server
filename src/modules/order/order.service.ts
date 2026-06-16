import { OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const hasOrdered = async (userId: string, mealId: string) => {
  return await prisma.orderItem.findFirst({
    where: {
      mealId: mealId,
      order: {
        customerId: userId,
      },
    },
    select: {
      mealId: true,
    },
  });
};

const editStatus = async (data: OrderStatus, id: string) => {
  return await prisma.order.update({
    where: {
      id,
    },
    data: {
      status: data,
    },
  });
};

const getOrders = async () => {
  return await prisma.order.findMany({
    include: {
      orderItems: true,
    },
  });
};

const getOrderWithUserId = async (userID: string) => {
  return await prisma.order.findMany({
    where: {
      customerId: userID,
    },
    include: {
      provider: {
        select: {
          name: true,
          location: true,
        },
      },
      orderItems: {
        include: {
          meal: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

type TOrderData = {
  delivaryAddress: string;
  longitude?: number;
  latitude?: number;
  customerId: string;

  orderItems: {
    mealId: string;
    quantity: number;
    price: number;
  }[];
};

const createOrder = async (
  data: TOrderData,
  customerId: string,
  providerId: string,
) => {
  const totalPrice = data.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return await prisma.order.create({
    data: {
      delivaryAddress: data.delivaryAddress,
      longitude: data.longitude ?? null,
      latitude: data.latitude ?? null,
      totalPrice,
      customerId,
      providerId,
      orderItems: {
        create: data.orderItems.map((item) => ({
          price: item.price,
          quantity: item.quantity,
          mealId: item.mealId,
        })),
      },
    },
  });
};
const getUserIdWithOrderId = async (id: string) => {
  return await prisma.order.findUnique({
    where: {
      id,
    },
    select: {
      customerId: true,
    },
  });
};

const deleteOrder = async (id: string) => {
  return await prisma.order.delete({
    where: {
      id,
    },
  });
};

const getOrdersByProviderId = async (providerId: string) => {
  return await prisma.order.findMany({
    where: {
      providerId,
    },
    include: {
      orderItems: {
        include: {
          meal: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createOrderReview = async (
  orderId: string,
  userId: string,
  data: { rating: number; comment?: string }
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      reviews: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.customerId !== userId) {
    throw new Error("Unauthorized: You do not own this order");
  }

  if (order.reviews.length > 0) {
    throw new Error("Order has already been reviewed");
  }

  return await prisma.$transaction(
    order.orderItems.map((item) =>
      prisma.review.create({
        data: {
          rating: data.rating,
          comment: data.comment || null,
          userId,
          mealId: item.mealId,
          providerId: order.providerId,
          orderId: order.id,
        },
      })
    )
  );
};

export const OrderService = {
  hasOrdered,
  getOrders,
  getOrderWithUserId,
  getOrdersByProviderId,
  createOrder,
  editStatus,
  getUserIdWithOrderId,
  deleteOrder,
  createOrderReview,
};
