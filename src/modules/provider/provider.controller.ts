import { NextFunction, Request, Response } from "express";
import { ProviderService } from "./provider.service";
import { sendResponse } from "../../utils/response";
import { ProviderProfile } from "../../generated/client";
import { UserRole } from "../../middleware/authorization";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/querybuilder.interface";
import { prisma } from "../../lib/prisma";
const getProviders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const queryBuilder = new QueryBuilder<ProviderProfile>(
      prisma.providerProfile,
      req.query as IQueryParams,
      {
        searchableFields: ["name", "location", "description"],
        filterableFields: ["location"],
      }
    )
      .search()
      .filter()
      .sort()
      .paginate();

    const data = await queryBuilder.execute();

    return sendResponse(res, 200, true, "Provider Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
const createProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const data = await ProviderService.createProvider(
      req.body,
      userId as string,
    );

    return sendResponse(res, 201, true, "Provider Created Successfully", data);
  } catch (error) {
    next(error);
  }
};
const getProviderWithId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const data = await ProviderService.getProviderWithId(id as string);

    return sendResponse(res, 200, true, "Provider Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await ProviderService.getProviderIdWithUserId(req.user?.id as string);
    return sendResponse(res, 200, true, "Provider Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
const editProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id as string;

    const owner = await ProviderService.getUserIdWithProvider(id as string);
    if (owner.userId !== userId && req.user?.role !== UserRole.ADMIN) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only edit your Provider Profile",
      );
    }

    const data = await ProviderService.editProvider(req.body, id as string);

    return sendResponse(res, 201, true, "Provider Edited Successfully", data);
  } catch (error) {
    next(error);
  }
};
const deleteProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id as string;

    const owner = await ProviderService.getUserIdWithProvider(id as string);
    if (owner.userId !== userId && req.user?.role !== UserRole.ADMIN) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only delete your Provider Profile",
      );
    }

    const data = await ProviderService.deleteProvider(id as string);

    return sendResponse(res, 200, true, "Provider Deleted Successfully", data);
  } catch (error) {
    next(error);
  }
};

export const ProviderController = {
  getProviders,
  getProviderWithId,
  getMyProfile,
  createProvider,
  editProvider,
  deleteProvider,
};
