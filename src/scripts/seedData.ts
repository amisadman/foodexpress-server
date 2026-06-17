import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const userIds: string[] = [];

const DEFAULT_PASSWORD = "password1234";

const reigsterUser = async (name: string, email: string, role: string) => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password: DEFAULT_PASSWORD,
        role,
      },
    });

    if (result.user?.id) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { emailVerified: true },
      });
    }

    return result.user?.id;
  } catch (error) {
    console.error(`Failed to register ${email}:`, error);
    throw error;
  }
};

const seedUsers = async() => {
  const usersData = [
    { name: "Rafiqul Islam", email: "user1@test.com", role: "USER" },
    { name: "Nusrat Jahan", email: "user2@test.com", role: "USER" },
    { name: "Kamal Hossain", email: "user3@test.com", role: "USER" },
    { name: "Fatema Begum", email: "user4@test.com", role: "USER" },
    { name: "Shahidul Alam", email: "user5@test.com", role: "USER" },
    { name: "Abdul Karim", email: "provider1@test.com", role: "PROVIDER" },
    { name: "Roksana Akter", email: "provider2@test.com", role: "PROVIDER" },
    { name: "Mahbub Rahman", email: "provider3@test.com", role: "PROVIDER" },
  ];

  for (const user of usersData) {
    const userId = await reigsterUser(
      user.name,
      user.email,
      user.role,
    );
    if (userId) {
      userIds.push(userId);
    }
  }

  console.log("Users registered via BetterAuth:", userIds);
}

async function main() {
  await seedUsers(); 
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
