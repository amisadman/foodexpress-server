import { Response, Request, NextFunction } from "express";
import { UserRole } from "../../middleware/authorization";
import { OrderService } from "./order.service";
import { sendResponse } from "../../utils/response";
import { ProviderService } from "../provider/provider.service";

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role === UserRole.ADMIN) {
      const data = await OrderService.getOrders();
      return sendResponse(res, 200, true, "Order fetched successfully", data);
    } else if (req.user?.role === UserRole.USER) {
      const data = await OrderService.getOrderWithUserId(
        req.user?.id as string,
      );
      return sendResponse(res, 200, true, "Order fetched successfully", data);
    } else if (req.user?.role === UserRole.PROVIDER) {
      const provider = await ProviderService.getProviderIdWithUserId(
        req.user?.id as string,
      );
      const data = await OrderService.getOrdersByProviderId(
        provider.id,
      );
      return sendResponse(res, 200, true, "Order fetched successfully", data);
    } else {
      throw new Error("Role not found.");
    }
  } catch (error) {
    next(error);
  }
};
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const mealId = req.body.orderItems[0].mealId;
    const provider = await ProviderService.getProviderIdWithMealId(mealId);

    const data = await OrderService.createOrder(
      req.body,
      userId as string,
      provider?.providerId as string,
    );
    return sendResponse(res, 201, true, "Order Created successfully", data);
  } catch (error) {
    next(error);
  }
};
const editStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const provider = await ProviderService.getProviderIdWithUserId(
      userId as string,
    );
    const owner = await ProviderService.getProviderIdWithOrderId(
      req.params.id as string,
    );

    if (provider.id !== owner?.providerId) {
      return sendResponse(
        res,
        404,
        false,
        "Forbidden, You can only edit your own order status.",
        null,
      );
    }

    const data = await OrderService.editStatus(
      req.body.status,
      req.params.id as string,
    );
    return sendResponse(res, 201, true, "Order Created successfully", data);
  } catch (error) {
    next(error);
  }
};
const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id as string;

    const owner = await OrderService.getUserIdWithOrderId(id as string);
    if (owner?.customerId !== userId && req.user?.role !== UserRole.ADMIN) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only cancel your own Order",
      );
    }

    const data = await OrderService.deleteOrder(id as string);

    return sendResponse(res, 200, true, "Order Canceled Successfully", data);
  } catch (error) {
    next(error);
  }
};
const createOrderReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const { rating, comment } = req.body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return sendResponse(res, 400, false, "Rating is required and must be a number between 1 and 5", null);
    }

    const data = await OrderService.createOrderReview(orderId, userId as string, { rating, comment });
    return sendResponse(res, 201, true, "Reviews submitted successfully", data);
  } catch (error: any) {
    if (error.message.includes("Unauthorized") || error.message.includes("own this order")) {
      return sendResponse(res, 403, false, error.message, null);
    }
    if (error.message.includes("already been reviewed")) {
      return sendResponse(res, 400, false, error.message, null);
    }
    next(error);
  }
};

export const OrderController = {
  getOrder,
  createOrder,
  editStatus,
  deleteOrder,
  createOrderReview,
};
