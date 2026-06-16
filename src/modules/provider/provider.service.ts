import { ProviderProfile, Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getProviders = async () => {
  return await prisma.providerProfile.findMany();
};

const getUserIdWithProvider = async (id: string) => {
  return await prisma.providerProfile.findFirstOrThrow({
    where: {
      id,
    },
    select: {
      userId: true,
    },
  });
};
const getProviderIdWithUserId = async (id: string) => {
  return await prisma.providerProfile.findFirstOrThrow({
    where: {
      userId: id,
    },
    select: {
      id: true,
    },
  });
};

const createProvider = async (
  data: Omit<ProviderProfile, "id" | "createdAt" | "updatedAt">,
  userId: string,
) => {
  return await prisma.$transaction([
    prisma.providerProfile.create({
      data: {
        ...data,
        userId,
      },
    }),

    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: Role.PROVIDER,
      },
    }),
  ]);
};
const editProvider = async (
  data: Partial<ProviderProfile>,
  providerId: string,
) => {
  return await prisma.providerProfile.update({
    where: {
      id: providerId,
    },
    data,
  });
};
const getProviderWithId = async (id: string) => {
  return await prisma.providerProfile.findUniqueOrThrow({
    where: {
      id: id,
    },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
};
const deleteProvider = async (id: string) => {
  return await prisma.providerProfile.delete({
    where: {
      id: id,
    },
  });
};
const getProviderIdWithOrderId = async (id: string) => {
  return await prisma.order.findUnique({
    where: {
      id,
    },
    select: {
      providerId: true,
    },
  });
};
const getProviderIdWithMealId = async (id: string) => {
  return await prisma.meal.findUnique({
    where: {
      id,
    },
    select: {
      providerId: true,
    },
  });
};
const updateProviderRating = async (providerId: string) => {
  const aggregateResult = await prisma.review.aggregate({
    _avg: {
      rating: true,
    },
    where: {
      providerId,
    },
  });

  const averageRating = aggregateResult._avg.rating ?? 5.0;

  await prisma.providerProfile.update({
    where: { id: providerId },
    data: { rating: averageRating },
  });

  return averageRating;
};

export const ProviderService = {
  getProviders,
  getProviderWithId,
  createProvider,
  editProvider,
  getUserIdWithProvider,
  getProviderIdWithUserId,
  deleteProvider,
  getProviderIdWithOrderId,
  getProviderIdWithMealId,
  updateProviderRating,
};
