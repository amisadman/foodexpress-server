import { Router } from "express";
import { MealsController } from "./meals.controller";
import  authorization, { UserRole } from "../../middleware/authorization";

const router: Router = Router();

router.get("/", MealsController.getMeals);
router.post("/", authorization(UserRole.PROVIDER), MealsController.createMeal);
router.get("/:id",MealsController.getMealsById)

export const MealsRoute = router;
