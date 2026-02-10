import { Request, Response, NextFunction } from "express";
import { MealsService } from "./meals.service";
import { sendResponse } from "../../utils/response";
import { ProviderService } from "../provider/provider.service";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/authorization";
import { OrderService } from "../order/order.service";

const getMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await MealsService.getMeals();
    return sendResponse(res, 200, true, "Meals fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const getMealsById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await MealsService.getMealsById(req.params.id as string);
    return sendResponse(res, 200, true, "Meal fetched successfully", data);
  } catch (error) {
    next(error);
  }
};
const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await MealsService.getReviews(req.params.id as string);
    return sendResponse(res, 200, true, "Reviews fetched successfully", data);
  } catch (error) {
    next(error);
  }
};
const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const mealId = req.params.id;
    const { providerId } = await MealsService.getProviderIdWithMealId(
      mealId as string,
    );
    const userId = req.user?.id;

    const ordered = await OrderService.hasOrdered(
      userId as string,
      mealId as string,
    );

    if (!ordered || ordered.mealId !== mealId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You need to order the item first",
        null,
      );
    }

    const data = await MealsService.createReview(
      req.body,
      mealId as string,
      providerId,
      userId as string,
    );
    return sendResponse(res, 201, true, "Reviews created successfully", data);
  } catch (error) {
    next(error);
  }
};

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id as string,
    );

    if (!providerId) {
      throw new Error("ProviderId not found");
    }
    const data = await MealsService.createMeal(req.body, providerId.id);
    return sendResponse(res, 201, true, "Meals created successfully", data);
  } catch (error) {
    next(error);
  }
};
const editMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id as string,
    );

    if (!providerId) {
      throw new Error("ProviderId not found");
    }

    const ownerId = await MealsService.getProviderIdWithMealId(
      req.params.id as string,
    );

    if (
      ownerId.providerId !== providerId.id &&
      req.user?.role !== UserRole.ADMIN
    ) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only edit your owm meal details",
      );
    }
    const data = await MealsService.editMeal(req.body, req.params.id as string);
    return sendResponse(res, 201, true, "Meals Edited successfully", data);
  } catch (error) {
    next(error);
  }
};
const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id as string,
    );

    if (!providerId) {
      throw new Error("ProviderId not found");
    }

    const ownerId = await MealsService.getProviderIdWithMealId(
      req.params.id as string,
    );

    if (
      ownerId.providerId !== providerId.id &&
      req.user?.role !== UserRole.ADMIN
    ) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only delete your owm meal details",
      );
    }
    const data = await MealsService.deleteMeal(req.params.id as string);
    return sendResponse(res, 200, true, "Meals deleted successfully", data);
  } catch (error) {
    next(error);
  }
};

export const MealsController = {
  getMeals,
  createMeal,
  getMealsById,
  editMeal,
  deleteMeal,
  getReviews,
  createReview,
};
