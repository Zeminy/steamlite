import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { serializeGame, serializeReview } from "../../utils/serializers";
import {
  gameDetailInclude,
  gameWithRelationsInclude,
  getGameAccessState,
  parseGamePrice,
  parseGameReleaseDate,
  parseOptionalDeveloperId,
  parseDiscountPercent,
  parseOptionalText,
  parseReviewRating,
} from "./game.shared";

export const gameRouter = Router();

const getDeveloperProfileForUser = async (userId: number) =>
  prisma.developer.findUnique({
    where: {
      userId,
    },
  });

const getOwnedGameForDeveloper = async (gameId: number, userId: number) => {
  const developerProfile = await getDeveloperProfileForUser(userId);

  if (!developerProfile) {
    throw new AppError(403, "Developer profile not found for this account.");
  }

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      developerId: developerProfile.id,
    },
    include: gameWithRelationsInclude,
  });

  if (!game) {
    throw new AppError(404, "Game not found in your developer catalog.");
  }

  return { developerProfile, game };
};

gameRouter.get(
  "/mine",
  requireAuth,
  requireRole(["DEVELOPER"]),
  asyncHandler(async (req, res) => {
    const developerProfile = await getDeveloperProfileForUser(req.user!.id);

    if (!developerProfile) {
      throw new AppError(403, "Developer profile not found for this account.");
    }

    const games = await prisma.game.findMany({
      where: {
        developerId: developerProfile.id,
      },
      include: gameWithRelationsInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json({
      games: games.map(serializeGame),
    });
  })
);

gameRouter.patch(
  "/mine/:id",
  requireAuth,
  requireRole(["DEVELOPER"]),
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.id);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const { developerProfile } = await getOwnedGameForDeveloper(gameId, req.user!.id);
    const { title, description, price, releaseDate, developerId, discountPercent } = req.body;
    const parsedPrice = price !== undefined ? parseGamePrice(price) : undefined;
    const parsedReleaseDate = releaseDate !== undefined ? parseGameReleaseDate(releaseDate) : undefined;
    const parsedDeveloperId = parseOptionalDeveloperId(developerId);
    if (price !== undefined && parsedPrice === null) {
      throw new AppError(400, "Price must be a valid non-negative number.");
    }

    if (releaseDate !== undefined && parsedReleaseDate === null) {
      throw new AppError(400, "Release date must be valid.");
    }

    if (developerId !== undefined && parsedDeveloperId !== null && parsedDeveloperId !== developerProfile.id) {
      throw new AppError(403, "Developers cannot assign games to another developer.");
    }

    if (discountPercent !== undefined) {
      throw new AppError(403, "Only admins can manage discounts.");
    }

    const updatedGame = await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        price: parsedPrice,
        genre: parseOptionalText(req.body.genre),
        coverImageUrl: parseOptionalText(req.body.coverImageUrl),
        releaseDate: parsedReleaseDate || undefined,
        developerId: developerProfile.id,
      },
      include: gameWithRelationsInclude,
    });

    res.json({
      message: "Game updated successfully.",
      game: serializeGame(updatedGame),
    });
  })
);

gameRouter.delete(
  "/mine/:id",
  requireAuth,
  requireRole(["DEVELOPER"]),
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.id);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const { game } = await getOwnedGameForDeveloper(gameId, req.user!.id);

    const usage = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        _count: {
          select: {
            orderItems: true,
            libraryItems: true,
          },
        },
      },
    });

    if (!usage) {
      throw new AppError(404, "Game not found.");
    }

    if (usage._count.orderItems > 0 || usage._count.libraryItems > 0) {
      throw new AppError(409, "Cannot delete games that already belong to existing orders or libraries.");
    }

    await prisma.game.delete({
      where: {
        id: game.id,
      },
    });

    res.json({
      message: "Game deleted successfully.",
    });
  })
);

gameRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();
    const sort = String(req.query.sort || "newest");
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    const where: Prisma.GameWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { genre: { contains: q } },
        { developer: { company: { contains: q } } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && !Number.isNaN(minPrice)) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
        where.price.lte = maxPrice;
      }
    }

    const orderBy =
      sort === "priceAsc"
        ? { price: "asc" as const }
        : sort === "priceDesc"
        ? { price: "desc" as const }
        : sort === "title"
        ? { title: "asc" as const }
        : { releaseDate: "desc" as const };

    const games = await prisma.game.findMany({
      where,
      orderBy,
      include: gameWithRelationsInclude,
    });

    res.json({
      games: games.map(serializeGame),
    });
  })
);

gameRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.id);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: gameDetailInclude,
    });

    if (!game) {
      throw new AppError(404, "Game not found.");
    }

    res.json({
      game: {
        ...serializeGame(game),
        reviews: game.reviews.map(serializeReview),
      },
    });
  })
);

gameRouter.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "DEVELOPER"]),
  asyncHandler(async (req, res) => {
    const { title, description, price, releaseDate, developerId, discountPercent } = req.body;
    const parsedPrice = parseGamePrice(price);
    const parsedReleaseDate = parseGameReleaseDate(releaseDate);
    const parsedDiscountPercent = parseDiscountPercent(discountPercent);
    const normalizedTitle = String(title || "").trim();
    const normalizedDescription = String(description || "").trim();

    if (!normalizedTitle || !normalizedDescription || parsedPrice === null || parsedReleaseDate === null) {
      throw new AppError(400, "Title, description, price and release date are required.");
    }

    if (discountPercent !== undefined && parsedDiscountPercent === null) {
      throw new AppError(400, "Discount percent must be a number between 0 and 90.");
    }

    let assignedDeveloperId: number | null = null;

    if (req.user!.role === "DEVELOPER") {
      const developerProfile = await getDeveloperProfileForUser(req.user!.id);

      if (!developerProfile) {
        throw new AppError(403, "Developer profile not found for this account.");
      }

      if (discountPercent !== undefined) {
        throw new AppError(403, "Only admins can manage discounts.");
      }

      assignedDeveloperId = developerProfile.id;
    } else {
      const parsedDeveloperId = parseOptionalDeveloperId(developerId);

      if (developerId !== undefined && developerId !== null && developerId !== "" && parsedDeveloperId === null) {
        throw new AppError(400, "Developer id must be a positive integer.");
      }

      if (parsedDeveloperId !== null) {
        const developer = await prisma.developer.findUnique({
          where: { id: parsedDeveloperId },
        });

        if (!developer) {
          throw new AppError(400, "Developer does not exist.");
        }
      }

      assignedDeveloperId = parsedDeveloperId;
    }

    const game = await prisma.game.create({
      data: {
        title: normalizedTitle,
        description: normalizedDescription,
        price: parsedPrice,
        discountPercent: req.user!.role === "ADMIN" ? parsedDiscountPercent || 0 : 0,
        genre: parseOptionalText(req.body.genre),
        coverImageUrl: parseOptionalText(req.body.coverImageUrl),
        releaseDate: parsedReleaseDate,
        developerId: assignedDeveloperId,
      },
      include: gameWithRelationsInclude,
    });

    res.status(201).json({
      message: "Game created successfully.",
      game: serializeGame(game),
    });
  })
);

gameRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]), // ✅ FIX
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.id);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!existingGame) {
      throw new AppError(404, "Game not found.");
    }

    const { title, description, price, releaseDate, developerId, discountPercent } = req.body;
    const parsedPrice = price !== undefined ? parseGamePrice(price) : undefined;
    const parsedReleaseDate = releaseDate !== undefined ? parseGameReleaseDate(releaseDate) : undefined;
    const parsedDeveloperId = parseOptionalDeveloperId(developerId);
    const parsedDiscountPercent = parseDiscountPercent(discountPercent);

    if (price !== undefined && parsedPrice === null) {
      throw new AppError(400, "Price must be a valid non-negative number.");
    }

    if (releaseDate !== undefined && parsedReleaseDate === null) {
      throw new AppError(400, "Release date must be valid.");
    }

    if (developerId !== undefined && developerId !== null && developerId !== "" && parsedDeveloperId === null) {
      throw new AppError(400, "Developer id must be a positive integer.");
    }

    if (discountPercent !== undefined && parsedDiscountPercent === null) {
      throw new AppError(400, "Discount percent must be a number between 0 and 90.");
    }

    if (parsedDeveloperId !== null) {
      const developer = await prisma.developer.findUnique({
        where: { id: parsedDeveloperId },
      });

      if (!developer) {
        throw new AppError(400, "Developer does not exist.");
      }
    }

    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        price: parsedPrice,
        discountPercent: discountPercent !== undefined ? parsedDiscountPercent || 0 : undefined,
        genre: parseOptionalText(req.body.genre),
        coverImageUrl: parseOptionalText(req.body.coverImageUrl),
        releaseDate: parsedReleaseDate || undefined,
        developerId: developerId !== undefined ? parsedDeveloperId : undefined,
      },
      include: gameWithRelationsInclude,
    });

    res.json({
      message: "Game updated successfully.",
      game: serializeGame(game),
    });
  })
);

gameRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.id);

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        _count: {
          select: {
            orderItems: true,
            libraryItems: true,
          },
        },
      },
    });

    if (!existingGame) {
      throw new AppError(404, "Game not found.");
    }

    if (existingGame._count.orderItems > 0 || existingGame._count.libraryItems > 0) {
      throw new AppError(409, "Cannot delete games that already belong to existing orders or libraries.");
    }

    await prisma.game.delete({
      where: { id: gameId },
    });

    res.json({
      message: "Game deleted successfully.",
    });
  })
);

gameRouter.post(
  "/:id/reviews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const gameId = Number(req.params.id);
    const rating = parseReviewRating(req.body.rating);
    const comment = req.body.comment ? String(req.body.comment).trim() : null;

    if (Number.isNaN(gameId)) {
      throw new AppError(400, "Invalid game id.");
    }

    if (rating === null) {
      throw new AppError(400, "Rating must be an integer between 1 and 5.");
    }

    const access = await getGameAccessState({
      gameId,
      userId: req.user!.id,
      role: req.user!.role,
    });

    if (!access.game) {
      throw new AppError(404, "Game not found.");
    }

    if (!access.canAccess) {
      throw new AppError(403, "Only owners, admins, or the game's developer can review this game.");
    }

    const review = await prisma.review.upsert({
      where: {
        userId_gameId: {
          userId: req.user!.id,
          gameId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: req.user!.id,
        gameId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Review saved successfully.",
      review: serializeReview(review),
    });
  })
);
