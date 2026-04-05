import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { serializeLibraryItem } from "../../utils/serializers";
import { gameWithRelationsInclude } from "../games/game.shared";

export const libraryRouter = Router();

libraryRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const libraryItems = await prisma.libraryItem.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        game: {
          include: gameWithRelationsInclude,
        },
      },
      orderBy: [
        {
          purchasedAt: "desc",
        },
        {
          id: "desc",
        },
      ],
    });

    res.json({
      library: libraryItems.map(serializeLibraryItem),
    });
  })
);
