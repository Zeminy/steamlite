import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { serializeOrder } from "../../utils/serializers";
import { ROLES } from "../../types/domain";
import { gameWithRelationsInclude } from "../games/game.shared";
import { calculateRevenueSplit } from "../../utils/revenue";
import { getReviewModerationReasons } from "../../utils/reviewModeration";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["ADMIN"]));

adminRouter.get(
  "/developers",
  asyncHandler(async (_req, res) => {
    const developers = await prisma.developer.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isBanned: true,
            deletedAt: true,
          },
        },
        _count: {
          select: {
            games: true,
          },
        },
      },
      orderBy: {
        company: "asc",
      },
    });

    res.json({
      developers: developers.map((developer) => ({
        id: developer.id,
        userId: developer.userId,
        username: developer.user.username,
        email: developer.user.email,
        company: developer.company,
        profile: developer.profile,
        role: developer.user.role,
        isBanned: developer.user.isBanned,
        deletedAt: developer.user.deletedAt,
        gamesCount: developer._count.games,
      })),
    });
  })
);

adminRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [usersCount, deletedUsersCount, gamesCount, ordersCount, orderTotals, recentOrders, reviews] =
      await Promise.all([
        prisma.user.count({
          where: {
            deletedAt: null,
          },
        }),
        prisma.user.count({
          where: {
            NOT: {
              deletedAt: null,
            },
          },
        }),
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
        prisma.review.findMany({
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isBanned: true,
                deletedAt: true,
              },
            },
            game: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);
    const revenueSplit = calculateRevenueSplit(orderTotals._sum.totalAmount || 0);

    const allFlaggedReviews = reviews
      .map((review) => ({
        review,
        reasons: getReviewModerationReasons({
          comment: review.comment,
          rating: review.rating,
        }),
      }))
      .filter((entry) => entry.reasons.length > 0);

    res.json({
      overview: {
        usersCount,
        deletedUsersCount,
        gamesCount,
        ordersCount,
        revenue: orderTotals._sum.totalAmount || 0,
        grossRevenue: revenueSplit.grossRevenue,
        platformRevenue: revenueSplit.platformRevenue,
        developerRevenue: revenueSplit.developerRevenue,
        commissionRate: revenueSplit.commissionRate,
        flaggedReviewCount: allFlaggedReviews.length,
        flaggedReviews: allFlaggedReviews.slice(0, 6).map((entry) => ({
          id: entry.review.id,
          rating: entry.review.rating,
          comment: entry.review.comment,
          createdAt: entry.review.createdAt,
          reasons: entry.reasons,
          game: {
            id: entry.review.game.id,
            title: entry.review.game.title,
          },
          user: {
            id: entry.review.user.id,
            username: entry.review.user.username,
            email: entry.review.user.email,
            isBanned: entry.review.user.isBanned,
            deletedAt: entry.review.user.deletedAt,
          },
        })),
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
        developer: {
          select: {
            company: true,
          },
        },
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
        isBanned: user.isBanned,
        deletedAt: user.deletedAt,
        developerCompany: user.developer?.company || null,
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

    if (req.user!.id === userId) {
      throw new AppError(400, "Admins cannot change their own role.");
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

    if (existingUser.deletedAt) {
      throw new AppError(409, "Deleted accounts cannot be edited.");
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

      if (nextRole !== "ADMIN") {
        await transaction.admin.deleteMany({
          where: { userId },
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

      if (nextRole !== "DEVELOPER") {
        await transaction.developer.deleteMany({
          where: { userId },
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
        isBanned: user.isBanned,
      },
    });
  })
);

adminRouter.patch(
  "/users/:id/ban",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      throw new AppError(400, "Invalid user id.");
    }

    if (req.user!.id === userId) {
      throw new AppError(400, "Admins cannot ban themselves.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    if (user.deletedAt) {
      throw new AppError(409, "Deleted accounts cannot be banned.");
    }

    if (user.isBanned) {
      return res.json({
        message: "User is already banned.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
      },
    });

    res.json({
      message: "User banned successfully.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isBanned: updatedUser.isBanned,
      },
    });
  })
);

adminRouter.patch(
  "/users/:id/unban",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      throw new AppError(400, "Invalid user id.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    if (user.deletedAt) {
      throw new AppError(409, "Deleted accounts cannot be unbanned.");
    }

    if (!user.isBanned) {
      return res.json({
        message: "User is already active.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
      },
    });

    res.json({
      message: "User unbanned successfully.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isBanned: updatedUser.isBanned,
      },
    });
  })
);

adminRouter.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      throw new AppError(400, "Invalid user id.");
    }

    if (req.user!.id === userId) {
      throw new AppError(400, "Admins cannot delete their own account.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError(404, "User not found.");
    }

    if (existingUser.deletedAt) {
      return res.json({
        message: "User is already deleted.",
      });
    }

    await prisma.$transaction(async (transaction) => {
      const userCart = await transaction.cart.findUnique({
        where: { userId },
      });
      const userWishlist = await transaction.wishlist.findUnique({
        where: { userId },
      });

      if (userCart) {
        await transaction.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      if (userWishlist) {
        await transaction.wishlistItem.deleteMany({
          where: { wishlistId: userWishlist.id },
        });
      }

      await transaction.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          deletedAt: new Date(),
          deletedReason:
            String(req.body?.reason || "Deleted by admin.").trim() || "Deleted by admin.",
        },
      });
    });

    res.json({
      message: "User deleted permanently.",
    });
  })
);
