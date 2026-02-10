import { Router } from "express";
import authorization, { UserRole } from "../../middleware/authorization";
import { CategoryController } from "./category.controller";

const router: Router = Router();

router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategoryById);
router.post("/", authorization(UserRole.ADMIN), CategoryController.createCategory);
router.patch("/:id", authorization(UserRole.ADMIN), CategoryController.updateCategory);
router.delete("/:id", authorization(UserRole.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;