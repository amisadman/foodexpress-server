import { Meal, Review } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getProviderIdWithMealId = async (id: string) => {
  return await prisma.meal.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      providerId: true,
    },
  });
};
const getMeals = async () => {
  return await prisma.meal.findMany({
    include: {
      provider: {
        select: {
          name: true,
          location: true,
          longitude: true,
          latitude: true,
        },
      },
    },
  });
};
const getMealsById = async (id: string) => {
  return await prisma.meal.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      provider: {
        select: {
          name: true,
          location: true,
          longitude: true,
          latitude: true,
        },
      },
    },
  });
};
const getReviews = async (id: string) => {
  return await prisma.review.findMany({
    where:{
      mealId: id
    },include: {
      provider:{
        select:{
          name: true,
          location: true
        }
      }
    
    }
  })
};

const createReview = async (
  data: Omit<Review, "id"|"comment" | "createdAt" | "updatedAt">,
  mealId :string,
  providerId: string,
  userId :string
) => {
  return await prisma.review.create({
    data:{
      ...data,
      mealId,
      providerId,
      userId
    }
  })
};
const createMeal = async (
  data: Omit<Meal, "id" | "createdAt" | "updatedAt" | "providerId">,
  providerId: string,
) => {
  return await prisma.meal.create({
    data: {
      ...data,
      providerId,
    },
  });
};
const editMeal = async (data: Partial<Meal>, id: string) => {
  return await prisma.meal.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
};
const deleteMeal = async (id: string) => {
  return await prisma.meal.delete({
    where: {
      id,
    },
  });
};

export const MealsService = {
  getMeals,
  createMeal,
  getMealsById,
  getProviderIdWithMealId,
  editMeal,
  deleteMeal,
  getReviews,
  createReview
};
