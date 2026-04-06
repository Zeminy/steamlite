import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";
import { serializeGame } from "../../utils/serializers";
import { gameWithRelationsInclude } from "../games/game.shared";

export const wishlistRouter = Router();

const getOrCreateWishlist = async (userId: number) =>
  prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          game: {
            include: gameWithRelationsInclude,
          },
        },
      },
    },
  });

wishlistRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const wishlist = await getOrCreateWishlist(req.user!.id);

    res.json({
      wishlist: {
        id: wishlist.id,
        items: wishlist.items.map((item) => ({
          id: item.id,
          game: serializeGame(item.game),
        })),
      },
    });
  })
);

wishlistRouter.post(
  "/:gameId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.gameId);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError(404, "Game not found.");
    }

    const wishlist = await getOrCreateWishlist(req.user!.id);

    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        gameId,
      },
    });

    if (existingItem) {
      throw new AppError(409, "This game is already in your wishlist.");
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        gameId,
      },
    });

    const refreshedWishlist = await getOrCreateWishlist(req.user!.id);

    res.status(201).json({
      message: "Game added to wishlist.",
      wishlist: {
        id: refreshedWishlist.id,
        items: refreshedWishlist.items.map((item) => ({
          id: item.id,
          game: serializeGame(item.game),
        })),
      },
    });
  })
);

wishlistRouter.delete(
  "/:gameId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.gameId);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const wishlist = await getOrCreateWishlist(req.user!.id);

    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        gameId,
      },
    });

    if (!existingItem) {
      throw new AppError(404, "Game is not in wishlist.");
    }

    await prisma.wishlistItem.delete({
      where: { id: existingItem.id },
    });

    const refreshedWishlist = await getOrCreateWishlist(req.user!.id);

    res.json({
      message: "Game removed from wishlist.",
      wishlist: {
        id: refreshedWishlist.id,
        items: refreshedWishlist.items.map((item) => ({
          id: item.id,
          game: serializeGame(item.game),
        })),
      },
    });
  })
);
