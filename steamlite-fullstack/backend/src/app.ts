import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { apiRouter } from "./routes";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.clientUrl.split(",").map((o) => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    message: "SteamLite backend is running.",
  });
});

app.use("/api", apiRouter);

app.use(errorHandler);
