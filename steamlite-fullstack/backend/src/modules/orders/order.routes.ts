import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";
import { serializeOrder } from "../../utils/serializers";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PaymentMethod,
} from "../../types/domain";
import { gameWithRelationsInclude, getGameAccessState } from "../games/game.shared";

export const orderRouter = Router();

orderRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
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
      orders: orders.map(serializeOrder),
    });
  })
);

orderRouter.post(
  "/checkout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const requestedMethod = String(req.body.paymentMethod || "CREDIT_CARD").toUpperCase();

    if (!PAYMENT_METHODS.includes(requestedMethod as PaymentMethod)) {
      throw new AppError(400, "Unsupported payment method.");
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            game: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError(400, "Cart is empty.");
    }

    const accessStates = await Promise.all(
      cart.items.map((item) =>
        getGameAccessState({
          gameId: item.gameId,
          userId: req.user!.id,
          role: req.user!.role,
        })
      )
    );
    const blockedPurchase = accessStates.find(
      (access) => access.hasLibraryOwnership || access.hasIntrinsicAccess
    );

    if (blockedPurchase) {
      throw new AppError(
        409,
        "Remove games you already own or already have access to before checking out."
      );
    }

    const normalizedItems = cart.items.map((item) => ({
      ...item,
      quantity: 1,
    }));
    const totalAmount = Number(
      normalizedItems.reduce((sum, item) => sum + item.quantity * item.game.price, 0).toFixed(2)
    );
    const purchasedAt = new Date();

    const order = await prisma.$transaction(async (transaction) => {
      const createdOrder = await transaction.order.create({
        data: {
          userId: req.user!.id,
          totalAmount,
          status: ORDER_STATUSES[1],
          items: {
            create: normalizedItems.map((item) => ({
              gameId: item.gameId,
              quantity: 1,
            })),
          },
          payment: {
            create: {
              amount: totalAmount,
              paymentMethod: requestedMethod as PaymentMethod,
              status: PAYMENT_STATUSES[1],
            },
          },
        },
        include: {
          items: {
            include: {
              game: {
                include: gameWithRelationsInclude,
              },
            },
          },
          payment: true,
        },
      });

      for (const item of normalizedItems) {
        await transaction.libraryItem.upsert({
          where: {
            userId_gameId: {
              userId: req.user!.id,
              gameId: item.gameId,
            },
          },
          update: {
            purchasedAt,
          },
          create: {
            userId: req.user!.id,
            gameId: item.gameId,
            purchasedAt,
          },
        });
      }

      await transaction.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    res.status(201).json({
      message: "Checkout completed successfully.",
      order: serializeOrder(order),
    });
  })
);
