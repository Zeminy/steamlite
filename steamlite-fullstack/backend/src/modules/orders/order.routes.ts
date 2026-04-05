import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";
import { serializeOrder } from "../../utils/serializers";

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
              include: {
                developer: true,
                reviews: true,
              },
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
    const requestedMethod = String(req.body.paymentMethod || PaymentMethod.CREDIT_CARD).toUpperCase();

    if (!Object.values(PaymentMethod).includes(requestedMethod as PaymentMethod)) {
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

    const totalAmount = Number(
      cart.items.reduce((sum, item) => sum + item.quantity * item.game.price, 0).toFixed(2)
    );

    const order = await prisma.$transaction(async (transaction) => {
      const createdOrder = await transaction.order.create({
        data: {
          userId: req.user!.id,
          totalAmount,
          status: OrderStatus.COMPLETED,
          items: {
            create: cart.items.map((item) => ({
              gameId: item.gameId,
              quantity: item.quantity,
            })),
          },
          payment: {
            create: {
              amount: totalAmount,
              paymentMethod: requestedMethod as PaymentMethod,
              status: PaymentStatus.SUCCESS,
            },
          },
        },
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
          payment: true,
        },
      });

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
