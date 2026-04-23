import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const bootstrap = async () => {
  await prisma.$connect();

  app.listen(env.port, () => {
    console.log(`SteamLite API listening on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server.", error);
  process.exit(1);
});
