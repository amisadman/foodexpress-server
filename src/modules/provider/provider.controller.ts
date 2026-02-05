import { NextFunction, Request, Response } from "express";
import { ProviderService } from "./provider.service";
import { sendResponse } from "../../utils/response";
import { ProviderProfile } from "../../../generated/prisma/client";

const getProviders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await ProviderService.getProviders();

    sendResponse(res, 200, true, "Provider Fetched Successfully", data);
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
    const data = await ProviderService.createProvider(req.body, userId as string);

    sendResponse(res, 201, true, "Provider Created Successfully", data);
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

    sendResponse(res, 200, true, "Provider Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};

export const ProviderController = {
  getProviders,
  getProviderWithId,
  createProvider
};
