import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { serializeOrder } from "../../utils/serializers";
import { ROLES } from "../../types/domain";
import { gameWithRelationsInclude } from "../games/game.shared";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["ADMIN"]));

adminRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [usersCount, gamesCount, ordersCount, revenue, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: "COMPLETED",
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          orderDate: "desc",
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
          items: {
            include: {
              game: {
                include: gameWithRelationsInclude,
              },
            },
          },
          payment: true,
        },
      }),
    ]);

    res.json({
      overview: {
        usersCount,
        gamesCount,
        ordersCount,
        revenue: revenue._sum.totalAmount || 0,
        recentOrders: recentOrders.map((order) => ({
          ...serializeOrder(order),
          user: order.user,
        })),
      },
    });
  })
);

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        orderCount: user._count.orders,
        reviewCount: user._count.reviews,
      })),
    });
  })
);

adminRouter.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            game: {
              include: gameWithRelationsInclude,
            },
          },
        },
        payment: true,
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    res.json({
      orders: orders.map((order) => ({
        ...serializeOrder(order),
        user: order.user,
      })),
    });
  })
);

adminRouter.patch(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const nextRole = String(req.body.role || "").toUpperCase();

    if (Number.isNaN(userId)) {
      throw new AppError(400, "Invalid user id.");
    }

    if (!ROLES.includes(nextRole as (typeof ROLES)[number])) {
      throw new AppError(400, "Invalid role.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError(404, "User not found.");
    }

    const user = await prisma.$transaction(async (transaction) => {
      const updatedUser = await transaction.user.update({
        where: { id: userId },
        data: {
          role: nextRole,
        },
      });

      if (nextRole === "ADMIN") {
        await transaction.admin.upsert({
          where: { userId },
          update: {
            permissions: "Manage games, users, orders, and dashboards",
          },
          create: {
            userId,
            permissions: "Manage games, users, orders, and dashboards",
          },
        });
      }

      if (nextRole === "DEVELOPER") {
        await transaction.developer.upsert({
          where: { userId },
          update: {
            company: `${updatedUser.username} Studio`,
            profile: "Generated developer profile from admin dashboard.",
          },
          create: {
            userId,
            company: `${updatedUser.username} Studio`,
            profile: "Generated developer profile from admin dashboard.",
          },
        });
      }

      return updatedUser;
    });

    res.json({
      message: "User role updated successfully.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  })
);
