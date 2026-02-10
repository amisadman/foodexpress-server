import { Request, Response, NextFunction } from "express";
import { MealsService } from "./meals.service";
import { sendResponse } from "../../utils/response";
import { ProviderService } from "../provider/provider.service";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/authorization";

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

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id as string,
    );

    if (!providerId) {
      throw new Error("ProviderId not found");
    }
    const data = await MealsService.createMeal(req.body, providerId.id);
    return sendResponse(res, 200, true, "Meals fetched successfully", data);
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
    return sendResponse(res, 200, true, "Meals Edited successfully", data);
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
};
