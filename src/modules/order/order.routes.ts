import { Router } from "express";
import authorization, { UserRole } from "../../middleware/authorization";
import { OrderController } from "./order.controller";

const router: Router = Router();

router.get(
  "/",
  authorization(UserRole.ADMIN, UserRole.USER, UserRole.PROVIDER),
  OrderController.getOrder,
);
router.post("/", authorization(UserRole.USER), OrderController.createOrder);
router.patch(
  "/:id",
  authorization(UserRole.PROVIDER),
  OrderController.editStatus,
);
router.delete(
  "/:id",
  authorization(UserRole.USER),
  OrderController.deleteOrder,
);

export const OrdersRoute = router;
