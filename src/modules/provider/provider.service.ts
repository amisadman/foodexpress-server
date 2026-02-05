import { ProviderProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getProviders = async () => {
  return await prisma.providerProfile.findMany();
};
const createProvider = async (
  data: Omit<ProviderProfile, "id" | "createdAt" | "updatedAt">,
  userId: string,
) => {
  return await prisma.providerProfile.create({
    data: {
      ...data,
      userId,
    },
  });
};
const getProviderWithId = async (id: string) => {
  return await prisma.providerProfile.findUniqueOrThrow({
    where: {
      id: id,
    },
  });
};

export const ProviderService = {
  getProviders,
  getProviderWithId,
  createProvider
};
