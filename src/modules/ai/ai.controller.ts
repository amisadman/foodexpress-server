import { Request, Response, NextFunction } from "express";
import { AiService } from "./ai.service";
import { sendResponse } from "../../utils/response";

const rephraseText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, tone } = req.body;
    if (!text || typeof text !== "string") {
      return sendResponse(res, 400, false, "Text is required and must be a string", null);
    }

    const rephrased = await AiService.rephrase(text, tone);
    return sendResponse(res, 200, true, "Text rephrased successfully", { text: rephrased });
  } catch (error) {
    next(error);
  }
};

export const AiController = {
  rephraseText,
};
