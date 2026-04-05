import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { gameRouter } from "../modules/games/game.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { wishlistRouter } from "../modules/wishlist/wishlist.routes";
import { orderRouter } from "../modules/orders/order.routes";
import { adminRouter } from "../modules/admin/admin.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/games", gameRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin", adminRouter);
