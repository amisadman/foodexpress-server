import { prisma } from "../../lib/prisma";

const getCategories = async () => {
  return await prisma.category.findMany();
};

const getCategoryById = async (id: string) => {
  return await prisma.category.findUniqueOrThrow({
    where: {
      id,
    },
  });
};

const createCategory = async (name: string) => {
  return await prisma.category.create({
    data: {
      name,
    },
  });
};

const updateCategory = async (id: string, name: string) => {
  return await prisma.category.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
};

const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: {
      id,
    },
  });
};

export const CategoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
