import { prisma } from "../../lib/prisma";

const getAnalytics = async () => {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProviders,
    totalMeals,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    dailyOrders,
    topMealsAgg,
    newUsersLast7Days,
    totalReviews,
    avgRatingAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.providerProfile.count(),
    prisma.meal.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["mealId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 10,
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);

  const topMealIds = topMealsAgg.map((m) => m.mealId);

  const topMeals = await prisma.meal.findMany({
    where: { id: { in: topMealIds } },
    include: { provider: true },
  });

  return {
    overview: {
      totalUsers,
      totalProviders,
      totalMeals,
      totalOrders,
      totalRevenue: revenueAgg._sum.totalPrice || 0,
      totalReviews,
      avgRating: avgRatingAgg._avg.rating || 0,
    },
    orders: {
      byStatus: ordersByStatus,
      dailyLast7Days: dailyOrders,
    },
    users: {
      newLast7Days: newUsersLast7Days,
    },
    meals: {
      topSelling: topMeals.map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.provider.name,
      })),
    },
  };
};

const getProviderAnalytics = async (providerId: string) => {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalMeals,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    dailyOrders,
    topMealsAgg,
    totalReviews,
    avgRatingAgg,
    newReviews7Days,
    newOrders7Days,
    recentReviews,
  ] = await Promise.all([
    prisma.meal.count({ where: { providerId } }),

    prisma.order.count({
      where: { providerId },
    }),

    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { providerId },
    }),

    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { providerId },
    }),

    prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: { gte: sevenDaysAgo },
        providerId,
      },
    }),

    prisma.orderItem.groupBy({
      by: ["mealId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      where: {
        meal: { providerId },
      },
      take: 5,
    }),

    prisma.review.count({ where: { providerId } }),

    prisma.review.aggregate({
      _avg: { rating: true },
      where: { providerId },
    }),

    prisma.review.count({
      where: {
        providerId,
        createdAt: { gte: sevenDaysAgo },
      },
    }),

    prisma.order.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        providerId,
      },
    }),

    prisma.review.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
  ]);

  const topMealIds = topMealsAgg.map((m) => m.mealId);

  const topMeals = await prisma.meal.findMany({
    where: { id: { in: topMealIds } },
  });

  return {
    overview: {
      totalMeals,
      totalOrders,
      totalRevenue: revenueAgg._sum.totalPrice || 0,
      totalReviews,
      avgRating: avgRatingAgg._avg.rating || 0,
    },
    orders: {
      byStatus: ordersByStatus,
      dailyLast7Days: dailyOrders,
      newLast7Days: newOrders7Days,
    },
    meals: {
      topSelling: topMeals.map((m) => ({
        id: m.id,
        name: m.name,
      })),
    },
    reviews: {
      newLast7Days: newReviews7Days,
      recent: recentReviews,
    },
  };
};

export const AnalyticsService = {
  getAnalytics,
  getProviderAnalytics
};
