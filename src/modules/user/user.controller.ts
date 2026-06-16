import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/response";
import { UserRole } from "../../middleware/authorization";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await UserService.getUsers();

    return sendResponse(res, 200, true, "Users Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};

const getUserWithId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== UserRole.ADMIN && id !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You can only view your own profile",
      );
    }

    const data = await UserService.getUserWithId(id as string);

    return sendResponse(res, 200, true, "User Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const data = await UserService.getUserWithId(userId as string);

    return sendResponse(res, 200, true, "Profile Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== UserRole.ADMIN && id !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You can only update your own profile",
      );
    }
    if (role === UserRole.USER) {
      delete req.body.role;
    }

    const data = await UserService.updateUser(req.body, id as string);

    return sendResponse(res, 200, true, "User Updated Successfully", data);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const data = await UserService.updateUserStatus(id as string, status);

    return sendResponse(
      res,
      200,
      true,
      "User Status Updated Successfully",
      data,
    );
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== UserRole.ADMIN && id !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You can only delete your own account",
      );
    }

    const data = await UserService.deleteUser(id as string);

    return sendResponse(res, 200, true, "User Deleted Successfully", data);
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  getUsers,
  getUserWithId,
  getMe,
  updateUser,
  updateUserStatus,
  deleteUser,
};
