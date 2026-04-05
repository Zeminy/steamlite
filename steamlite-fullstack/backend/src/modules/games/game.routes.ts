import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { serializeGame, serializeReview } from "../../utils/serializers";
import { gameDetailInclude, gameWithRelationsInclude, parseReviewRating } from "./game.shared";

export const gameRouter = Router();

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
    const { title, description, price, releaseDate, developerId } = req.body;

    if (!title || !description || price === undefined || !releaseDate) {
      throw new AppError(400, "Title, description, price and release date are required.");
    }

    const parsedDeveloperId =
      developerId !== undefined && developerId !== null && developerId !== ""
        ? Number(developerId)
        : undefined;

    if (parsedDeveloperId !== undefined) {
      const developer = await prisma.developer.findUnique({
        where: { id: parsedDeveloperId },
      });

      if (!developer) {
        throw new AppError(400, "Developer does not exist.");
      }
    }

    const game = await prisma.game.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        price: Number(price),
        genre: req.body.genre ? String(req.body.genre).trim() : null,
        coverImageUrl: req.body.coverImageUrl ? String(req.body.coverImageUrl).trim() : null,
        releaseDate: new Date(releaseDate),
        developerId: parsedDeveloperId,
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

    const { title, description, price, releaseDate, developerId } = req.body;

    const parsedDeveloperId =
      developerId !== undefined && developerId !== null && developerId !== ""
        ? Number(developerId)
        : existingGame.developerId;

    if (parsedDeveloperId !== undefined && parsedDeveloperId !== null) {
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
        price: price !== undefined ? Number(price) : undefined,
        genre: req.body.genre !== undefined ? String(req.body.genre).trim() || null : undefined,
        coverImageUrl:
          req.body.coverImageUrl !== undefined
            ? String(req.body.coverImageUrl).trim() || null
            : undefined,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        developerId: parsedDeveloperId,
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
    });

    if (!existingGame) {
      throw new AppError(404, "Game not found.");
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

    const [game, ownership] = await Promise.all([
      prisma.game.findUnique({ where: { id: gameId } }),
      prisma.libraryItem.findUnique({
        where: {
          userId_gameId: {
            userId: req.user!.id,
            gameId,
          },
        },
      }),
    ]);

    if (!game) {
      throw new AppError(404, "Game not found.");
    }

    if (!ownership) {
      throw new AppError(403, "You can only review games that you own.");
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
