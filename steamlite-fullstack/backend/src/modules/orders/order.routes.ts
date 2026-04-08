import { randomBytes } from "crypto";
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
  Role,
} from "../../types/domain";
import { gameWithRelationsInclude, getGameAccessState } from "../games/game.shared";
import { calculateDiscountedPrice } from "../../utils/pricing";
import { calculateRevenueSplit } from "../../utils/revenue";
import { buildOrderConfirmationEmail, queueTransactionalEmail } from "../../utils/email";
import { validatePaymentDetails } from "../../utils/paymentValidation";

export const orderRouter = Router();

const orderInclude = {
  items: {
    include: {
      game: {
        include: gameWithRelationsInclude,
      },
    },
  },
  payment: true,
  emailDeliveries: {
    orderBy: {
      sentAt: "desc" as const,
    },
  },
};

const getCheckoutContext = async (userId: number, role: Role) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
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
        userId,
        role,
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

  const normalizedItems = cart.items.map((item) => {
    const pricing = calculateDiscountedPrice(item.game.price, item.game.discountPercent || 0);

    return {
      ...item,
      quantity: 1,
      pricing,
    };
  });

  const totalAmount = Number(
    normalizedItems.reduce((sum, item) => sum + item.pricing.finalPrice, 0).toFixed(2)
  );

  return {
    cart,
    normalizedItems,
    totalAmount,
  };
};

const generateConfirmationCode = () =>
  `SL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

orderRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user!.id,
      },
      include: orderInclude,
      orderBy: {
        orderDate: "desc",
      },
    });

    res.json({
      orders: orders.map(serializeOrder),
    });
  })
);

orderRouter.get(
  "/checkout/preview",
  requireAuth,
  asyncHandler(async (req, res) => {
    const checkoutContext = await getCheckoutContext(req.user!.id, req.user!.role);

    res.json({
      receiptEmail: req.user!.email,
      paymentMethods: PAYMENT_METHODS,
      cart: {
        totalItems: checkoutContext.normalizedItems.length,
        totalAmount: checkoutContext.totalAmount,
        items: checkoutContext.normalizedItems.map((item) => ({
          id: item.id,
          quantity: 1,
          gameId: item.gameId,
          title: item.game.title,
          developerCompany: item.game.developerId ? undefined : "Independent",
          baseUnitPrice: item.pricing.basePrice,
          discountPercent: item.pricing.discountPercent,
          finalUnitPrice: item.pricing.finalPrice,
        })),
      },
    });
  })
);

orderRouter.get(
  "/:id/confirmation",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);

    if (Number.isNaN(orderId)) {
      throw new AppError(400, "Invalid order id.");
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user!.id,
      },
      include: orderInclude,
    });

    if (!order) {
      throw new AppError(404, "Order confirmation not found.");
    }

    res.json({
      order: serializeOrder(order),
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

    const paymentMethod = requestedMethod as PaymentMethod;
    let paymentMeta;

    try {
      paymentMeta = validatePaymentDetails(paymentMethod, req.body.paymentDetails);
    } catch (error) {
      throw new AppError(400, error instanceof Error ? error.message : "Payment details are invalid.");
    }

    const checkoutContext = await getCheckoutContext(req.user!.id, req.user!.role);
    const revenueSplit = calculateRevenueSplit(checkoutContext.totalAmount);
    const purchasedAt = new Date();
    const confirmationCode = generateConfirmationCode();

    const order = await prisma.$transaction(async (transaction) => {
      const createdOrder = await transaction.order.create({
        data: {
          userId: req.user!.id,
          totalAmount: checkoutContext.totalAmount,
          receiptEmail: req.user!.email,
          confirmationCode,
          confirmedAt: purchasedAt,
          platformRevenue: revenueSplit.platformRevenue,
          developerRevenue: revenueSplit.developerRevenue,
          commissionRate: revenueSplit.commissionRate,
          status: ORDER_STATUSES[1],
          items: {
            create: checkoutContext.normalizedItems.map((item) => ({
              gameId: item.gameId,
              quantity: 1,
              baseUnitPrice: item.pricing.basePrice,
              discountPercent: item.pricing.discountPercent,
              finalUnitPrice: item.pricing.finalPrice,
            })),
          },
          payment: {
            create: {
              amount: checkoutContext.totalAmount,
              paymentMethod,
              status: PAYMENT_STATUSES[1],
              providerReference: paymentMeta.providerReference,
              cardBrand: paymentMeta.cardBrand || null,
              last4: paymentMeta.last4 || null,
            },
          },
        },
        include: orderInclude,
      });

      for (const item of checkoutContext.normalizedItems) {
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

      const wishlist = await transaction.wishlist.findUnique({
        where: {
          userId: req.user!.id,
        },
        select: {
          id: true,
        },
      });

      if (wishlist) {
        await transaction.wishlistItem.deleteMany({
          where: {
            wishlistId: wishlist.id,
            gameId: {
              in: checkoutContext.normalizedItems.map((item) => item.gameId),
            },
          },
        });
      }

      await transaction.cartItem.deleteMany({
        where: {
          cartId: checkoutContext.cart.id,
        },
      });

      return createdOrder;
    });

    let emailDeliveryMeta: {
      recipient: string;
      status: string;
      sentAt: Date | null;
      provider: string;
    } | null = null;

    try {
      const receipt = buildOrderConfirmationEmail({
        username: req.user!.username,
        orderId: order.id,
        confirmationCode,
        totalAmount: checkoutContext.totalAmount,
        itemTitles: order.items.map((item) => item.game.title),
      });
      const emailDelivery = await queueTransactionalEmail({
        userId: req.user!.id,
        orderId: order.id,
        recipient: req.user!.email,
        subject: receipt.subject,
        template: receipt.template,
        bodyText: receipt.bodyText,
        bodyHtml: receipt.bodyHtml,
      });

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          confirmationSentAt: emailDelivery.sentAt,
        },
      });

      emailDeliveryMeta = {
        recipient: emailDelivery.recipient,
        status: emailDelivery.status,
        sentAt: emailDelivery.sentAt,
        provider: emailDelivery.provider,
      };
    } catch (_error) {
      emailDeliveryMeta = {
        recipient: req.user!.email,
        status: "FAILED",
        sentAt: null,
        provider: "APP_PREVIEW",
      };
    }

    const refreshedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
      include: orderInclude,
    });

    res.status(201).json({
      message: "Checkout completed successfully.",
      order: serializeOrder(refreshedOrder || order),
      emailDelivery: emailDeliveryMeta,
    });
  })
);
