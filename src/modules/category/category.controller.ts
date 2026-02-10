import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/response";
import { CategoryService } from "./category.service";

const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await CategoryService.getCategories();
    return sendResponse(
      res,
      200,
      true,
      "Categories Fetched Successfully",
      data,
    );
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const data = await CategoryService.getCategoryById(id as string);
    return sendResponse(res, 200, true, "Category Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const name = req.body.name;
    const data = await CategoryService.createCategory(name);
    return sendResponse(res, 201, true, "Category Created Successfully", data);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await CategoryService.updateCategory(
      req.params.id as string,
      req.body.name,
    );
    return sendResponse(res, 200, true, "Category Updated Successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await CategoryService.deleteCategory(req.params.id as string);
    return sendResponse(res, 200, true, "Category Deleted Successfully", data);
  } catch (error) {
    next(error);
  }
};

export const CategoryController = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
