import { Router } from "express";
import { ProviderRouter } from "../modules/provider/provider.routes";
import { UserRouter } from "../modules/user/user.route";
import { MealsRoute } from "../modules/meals/meals.route";


const router: Router = Router();

router.use("/providers", ProviderRouter);
router.use("/user", UserRouter);
router.use("/meals", MealsRoute);
export const routes = router;
