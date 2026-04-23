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
    // 1. Fetch purchased items
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
      ],
    });

    // 2. Fetch games created by the developer (if user is a developer)
    let developerGames: any[] = [];
    if (req.user!.role === "DEVELOPER") {
      const developer = await prisma.developer.findUnique({
        where: { userId: req.user!.id },
        include: {
          games: {
            include: gameWithRelationsInclude,
          },
        },
      });

      if (developer) {
        developerGames = developer.games.map((game) => ({
          id: -game.id, // Negative ID to avoid collisions with library items, though not strictly necessary if handled correctly
          userId: req.user!.id,
          gameId: game.id,
          purchasedAt: game.createdAt,
          game: game,
        }));
      }
    }

    // 3. Combine and sort
    const combined = [...libraryItems, ...developerGames].sort(
      (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
    );

    res.json({
      library: combined.map(serializeLibraryItem),
    });
  })
);
