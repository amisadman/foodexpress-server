import { Router } from "express";
import { ProviderController } from "./provider.controller";
import authorization, { UserRole } from "../../middleware/authorization";

const router: Router = Router();

router.get("/", ProviderController.getProviders);
router.post(
  "/",
  authorization(UserRole.USER, UserRole.ADMIN, UserRole.PROVIDER),
  ProviderController.createProvider,
);
router.get("/me", authorization(UserRole.PROVIDER), ProviderController.getMyProfile);
router.get("/:id", ProviderController.getProviderWithId);
router.patch(
  "/:id",
  authorization(UserRole.PROVIDER, UserRole.ADMIN),
  ProviderController.editProvider,
);
router.delete(
  "/:id",
  authorization(UserRole.PROVIDER, UserRole.ADMIN),
  ProviderController.deleteProvider,
);

export const ProviderRouter = router;
