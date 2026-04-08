import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";
import { serializeCart } from "../../utils/serializers";
import { gameWithRelationsInclude, getGameAccessState } from "../games/game.shared";

export const cartRouter = Router();

const getOrCreateCart = async (userId: number) => {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  await prisma.cartItem.updateMany({
    where: {
      cartId: cart.id,
      quantity: {
        not: 1,
      },
    },
    data: {
      quantity: 1,
    },
  });

  return prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
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
};

cartRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user!.id);

    res.json({
      cart: serializeCart(cart),
    });
  })
);

cartRouter.post(
  "/items",
  requireAuth,
  asyncHandler(async (req, res) => {
    const gameId = Number(req.body.gameId);
    const quantity = req.body.quantity !== undefined ? Number(req.body.quantity) : 1;

    if (Number.isNaN(gameId) || Number.isNaN(quantity)) {
      throw new AppError(400, "Valid gameId and quantity are required.");
    }

    if (quantity !== 1) {
      throw new AppError(400, "Digital games can only be added once per cart.");
    }

    const access = await getGameAccessState({
      gameId,
      userId: req.user!.id,
      role: req.user!.role,
    });

    if (!access.game) {
      throw new AppError(404, "Game not found.");
    }

    if (access.hasLibraryOwnership) {
      throw new AppError(409, "You already own this game.");
    }

    if (access.hasIntrinsicAccess) {
      throw new AppError(409, "You already have full access to this game.");
    }

    const cart = await getOrCreateCart(req.user!.id);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        gameId,
      },
    });

    if (existingItem) {
      throw new AppError(409, "This game is already in your cart.");
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        gameId,
        quantity: 1,
      },
    });

    const refreshedCart = await getOrCreateCart(req.user!.id);

    res.status(201).json({
      message: "Game added to cart.",
      cart: serializeCart(refreshedCart),
    });
  })
);

cartRouter.patch(
  "/items/:cartItemId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const cartItemId = Number(req.params.cartItemId);
    const quantity = Number(req.body.quantity);

    if (Number.isNaN(cartItemId) || Number.isNaN(quantity)) {
      throw new AppError(400, "Valid cart item id and quantity are required.");
    }

    if (quantity !== 1) {
      throw new AppError(400, "Digital games can only have quantity 1.");
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== req.user!.id) {
      throw new AppError(404, "Cart item not found.");
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    const refreshedCart = await getOrCreateCart(req.user!.id);

    res.json({
      message: "Cart updated successfully.",
      cart: serializeCart(refreshedCart),
    });
  })
);

cartRouter.delete(
  "/items/:cartItemId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const cartItemId = Number(req.params.cartItemId);

    if (Number.isNaN(cartItemId)) {
      throw new AppError(400, "Invalid cart item id.");
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== req.user!.id) {
      throw new AppError(404, "Cart item not found.");
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    const refreshedCart = await getOrCreateCart(req.user!.id);

    res.json({
      message: "Item removed from cart.",
      cart: serializeCart(refreshedCart),
    });
  })
);
