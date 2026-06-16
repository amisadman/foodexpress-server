import { Router } from "express";
import { ProviderRouter } from "../modules/provider/provider.routes";
import { UserRouter } from "../modules/user/user.route";
import { MealsRoute } from "../modules/meals/meals.route";
import { OrdersRoute } from "../modules/order/order.routes";
import { AnalyticsRoute } from "../modules/analytics/analytics.routes";
import { CategoryRoutes } from "../modules/category/category.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PaymentsRoute } from "../modules/payments/payments.route";


const router: Router = Router();

router.use("/providers", ProviderRouter);
router.use("/user", UserRouter);
router.use("/meals", MealsRoute);
router.use("/orders", OrdersRoute);
router.use("/analytics", AnalyticsRoute);
router.use("/categories", CategoryRoutes);
router.use("/payments", PaymentsRoute);

router.use("/auth",AuthRoutes);
export const routes = router;
