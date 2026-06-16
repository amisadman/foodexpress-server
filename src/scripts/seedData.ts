import { ProviderProfile } from "@prisma/client";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const userIds: string[] = [];
const providerIds: string[] = [];

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

    return result.user?.id;
  } catch (error) {
    console.error(`Failed to register ${email}:`, error);
    throw error;
  }
};

const seedUsers = async()=> {
  const usersData = [
    { name: "Rafiqul Islam", email: "user1@test.com", role: "USER" },
    { name: "Nusrat Jahan", email: "user2@test.com", role: "USER" },
    { name: "Kamal Hossain", email: "user3@test.com", role: "USER" },
    { name: "Fatema Begum", email: "user4@test.com", role: "USER" },
    { name: "Shahidul Alam", email: "user5@test.com", role: "USER" },
    { name: "Abdul Karim", email: "user6@test.com", role: "PROVIDER" },
    { name: "Roksana Akter", email: "user7@test.com", role: "PROVIDER" },
    { name: "Mahbub Rahman", email: "user8@test.com", role: "PROVIDER" },
    { name: "Nasima Sultana", email: "user9@test.com", role: "PROVIDER" },
    {
      name: "Habibur Chowdhury",
      email: "user10@test.com",
      role: "PROVIDER",
    },
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

const seedProviders = async()=> {
  const restaurants = [
    { name: "Tasty Kitchen", location: "Dhaka", userId: userIds[5] as string },
    { name: "Spicy House", location: "Sylhet", userId: userIds[6] as string },
    { name: "Green Bowl", location: "Chittagong", userId: userIds[7] as string },
    { name: "Urban Eats", location: "Khulna", userId: userIds[8] as string },
    { name: "Food Street", location: "Rajshahi", userId: userIds[9] as string },
  ];

  for (const r of restaurants) {
    const created = await prisma.providerProfile.create({ data: { ...r } });
    providerIds.push(created.id);
  }

  console.log("Restaurants seeded:", providerIds);
}

async function seedMeals() {
  const mealsData = [] as any[];
  const mealNames = [
    "Chicken Biryani",
    "Beef Tehari",
    "Fried Rice",
    "Burger",
    "Pizza",
    "Pasta",
    "Chicken Curry",
    "Beef Curry",
    "Vegetable Khichuri",
    "Noodles",
    "Grilled Chicken",
    "Shawarma",
    "Kebab",
    "Sandwich",
    "Soup",
    "Salad",
    "Tandoori",
    "Butter Chicken",
    "Fish Fry",
    "Egg Fried Rice",
  ];

  let p = 0;
  for (let i = 0; i < 20; i++) {
    mealsData.push({
      name: mealNames[i],
      description: `${mealNames[i]} special`,
      price: 120 + i * 5,
      providerId: providerIds[p],
    });
    p = (p + 1) % providerIds.length;
  }

  for (const meal of mealsData) {
    await prisma.meal.create({ data: meal });
  }

  console.log("20 Meals seeded");
}

async function main() {
  await seedUsers(); 
  await seedProviders(); 
  await seedMeals();
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
