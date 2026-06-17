import { Role } from "../generated/client";
import { env } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  console.log("Running seed Admin script...");

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: env.adminEmail as string,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists!");
    return;
  }

  const data = await auth.api.signUpEmail({
    body: {
      name: "Admin",
      email: env.adminEmail as string,
      password: env.adminPass as string,
      role: Role.ADMIN
    },
  });

  await prisma.user.update({
    where:{
        id: data.user.id as string
    },
    data:{
        emailVerified : true
    }
  })

  console.log("Admin seeded successfully");

  console.log(data);
};
