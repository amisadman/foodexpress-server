import { Router } from "express";
import { MealsController } from "./meals.controller";
import authorization, { UserRole } from "../../middleware/authorization";

const router: Router = Router();

router.get("/", MealsController.getMeals);
router.post("/", authorization(UserRole.PROVIDER), MealsController.createMeal);

router.get("/:id", MealsController.getMealsById);
router.patch(
  "/:id",
  authorization(UserRole.PROVIDER, UserRole.ADMIN),
  MealsController.editMeal,
);
router.delete(
  "/:id",
  authorization(UserRole.PROVIDER, UserRole.ADMIN),
  MealsController.deleteMeal,
);

router.get("/:id/reviews", MealsController.getReviews);
router.post(
  "/:id/reviews",
  authorization(UserRole.USER),
  MealsController.createReview,
);

export const MealsRoute = router;
