import { User, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      providerProfile: true,
    },
  });
};

const getUserWithId = async (id: string) => {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
};

const updateUser = async (data: Partial<User>, id: string) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
};

const updateUserStatus = async (id: string, status: UserStatus) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: {
      id,
    },
  });
};

export const UserService = {
  getUsers,
  getUserWithId,
  updateUser,
  updateUserStatus,
  deleteUser,
};
