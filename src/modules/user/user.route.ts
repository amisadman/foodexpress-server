import { Router } from "express";
import authorization, { UserRole } from "../../middleware/authorization";
import { UserController } from "./user.controller";

const router = Router();

router.get("/", authorization(UserRole.ADMIN), UserController.getUsers);
router.get(
  "/me",
  authorization(UserRole.USER, UserRole.ADMIN, UserRole.PROVIDER),
  UserController.getMe,
);
router.get(
  "/:id",
  authorization(UserRole.USER, UserRole.ADMIN, UserRole.PROVIDER),
  UserController.getUserWithId,
);
router.patch(
  "/:id",
  authorization(UserRole.USER, UserRole.ADMIN, UserRole.PROVIDER),
  UserController.updateUser,
);
router.patch(
  "/:id/status",
  authorization(UserRole.ADMIN),
  UserController.updateUserStatus,
);
router.delete(
  "/:id",
  authorization(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER),
  UserController.deleteUser,
);

export const UserRouter: Router = router;
