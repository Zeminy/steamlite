import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";
import { serializeCart } from "../../utils/serializers";

export const cartRouter = Router();

const getOrCreateCart = async (userId: number) =>
  prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          game: {
            include: {
              developer: true,
              reviews: true,
            },
          },
        },
      },
    },
  });

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
    const quantity = req.body.quantity ? Number(req.body.quantity) : 1;

    if (Number.isNaN(gameId) || Number.isNaN(quantity) || quantity < 1) {
      throw new AppError(400, "Valid gameId and quantity are required.");
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError(404, "Game not found.");
    }

    const cart = await getOrCreateCart(req.user!.id);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        gameId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          gameId,
          quantity,
        },
      });
    }

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

    if (Number.isNaN(cartItemId) || Number.isNaN(quantity) || quantity < 1) {
      throw new AppError(400, "Valid cart item id and quantity are required.");
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
