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

export const OrderService = {
  hasOrdered,
  getOrders,
  getOrderWithUserId,
  createOrder,
  editStatus,
  getUserIdWithOrderId,
  deleteOrder
};
