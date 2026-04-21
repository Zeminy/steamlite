import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { PLATFORM_COMMISSION_RATE } from "../../utils/revenue";

export const developerRouter = Router();

developerRouter.use(requireAuth, requireRole(["DEVELOPER"]));

developerRouter.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const developer = await prisma.developer.findUnique({
      where: { userId: req.user!.id },
      include: {
        games: {
          include: {
            _count: {
              select: {
                orderItems: true,
              },
            },
            orderItems: {
              where: {
                order: {
                  status: "COMPLETED",
                },
              },
              select: {
                finalUnitPrice: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!developer) {
      return res.status(403).json({ message: "Developer profile not found." });
    }

    const gamesCount = developer.games.length;
    let totalSalesCount = 0;
    let grossRevenue = 0;

    developer.games.forEach((game) => {
      game.orderItems.forEach((item) => {
        totalSalesCount += item.quantity;
        grossRevenue += item.finalUnitPrice * item.quantity;
      });
    });

    const platformRevenue = Number((grossRevenue * PLATFORM_COMMISSION_RATE).toFixed(2));
    const developerRevenue = Number((grossRevenue - platformRevenue).toFixed(2));

    res.json({
      overview: {
        gamesCount,
        totalSalesCount,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        platformRevenue,
        developerRevenue,
        commissionRate: PLATFORM_COMMISSION_RATE,
      },
    });
  })
);
