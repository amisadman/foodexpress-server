import { Request, Response, NextFunction } from "express";
import { PaymentsService } from "./payments.service";
import { sendResponse } from "../../utils/response";

const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized user session");
    }

    const result = await PaymentsService.createCheckoutSession(
      req.body,
      userId
    );

    return sendResponse(res, 201, true, "Order checkout initiated successfully", result);
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const rawBody = (req as any).rawBody;

    if (!signature || !rawBody) {
      return res.status(400).send("Missing stripe signature or raw body");
    }

    await PaymentsService.handleWebhook(rawBody, signature);

    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const PaymentsController = {
  createCheckoutSession,
  handleWebhook,
};
