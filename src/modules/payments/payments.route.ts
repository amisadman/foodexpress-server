import { Router } from "express";
import authorization, { UserRole } from "../../middleware/authorization";
import { PaymentsController } from "./payments.controller";

const router: Router = Router();

router.post(
  "/create-checkout-session",
  authorization(UserRole.USER),
  PaymentsController.createCheckoutSession
);

router.post("/webhook", PaymentsController.handleWebhook);

export const PaymentsRoute = router;
