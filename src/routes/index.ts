import { Router } from "express";
import { ProviderRouter } from "../modules/provider/provider.routes";

const router: Router = Router();

router.use("/provider", ProviderRouter);

export const routes = router;
