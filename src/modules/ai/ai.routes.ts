import { Router } from "express";
import { AiController } from "./ai.controller";
import authorization, { UserRole } from "../../middleware/authorization";

const router: Router = Router();

router.post(
  "/rephrase",
  authorization(UserRole.PROVIDER, UserRole.ADMIN),
  AiController.rephraseText
);

export const AiRouter: Router = router;
