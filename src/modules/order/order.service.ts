import { prisma } from "../../lib/prisma";

const hasOrdered = async (userId: string, mealId: string) => {
  return await prisma.orderItem.findFirst({
    where: {
      mealId: mealId,
      order: {
        customerId: userId,
      },
    },
    select:{
        mealId : true
    }
  });
};

export const OrderService = {
  hasOrdered,
};
