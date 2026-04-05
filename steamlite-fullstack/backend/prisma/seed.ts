import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hash = (value: string) => bcrypt.hash(value, 10);

async function main() {
  await prisma.review.deleteMany();
  await prisma.libraryItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.game.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.user.deleteMany();

  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@steamlite.local",
      password: await hash("Admin123!"),
      role: "ADMIN",
      cart: { create: {} },
      wishlist: { create: {} },
      admin: {
        create: {
          permissions: "Manage games, users, orders, and dashboards",
        },
      },
    },
  });

  const developerUser = await prisma.user.create({
    data: {
      username: "devuser",
      email: "dev@steamlite.local",
      password: await hash("Dev123!"),
      role: "DEVELOPER",
      cart: { create: {} },
      wishlist: { create: {} },
      developer: {
        create: {
          company: "IndieForge Studio",
          profile: "Focused on story-rich indie games and co-op gameplay.",
        },
      },
    },
    include: {
      developer: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      username: "playerone",
      email: "user@steamlite.local",
      password: await hash("User123!"),
      role: "CUSTOMER",
      cart: { create: {} },
      wishlist: { create: {} },
    },
    include: {
      cart: true,
      wishlist: true,
    },
  });

  const developerId = developerUser.developer!.id;

  const gameCatalog = [
    {
      title: "Skybreak Tactics",
      description: "Turn-based sci-fi strategy with modular squads and orbital support.",
      price: 19.99,
      genre: "Strategy",
      coverImageUrl: "https://picsum.photos/seed/skybreak-tactics/640/360",
      releaseDate: new Date("2025-02-18"),
    },
    {
      title: "Neon Drifter",
      description: "Arcade racing through cyberpunk cities with upgradeable hover cars.",
      price: 14.5,
      genre: "Racing",
      coverImageUrl: "https://picsum.photos/seed/neon-drifter/640/360",
      releaseDate: new Date("2024-11-03"),
    },
    {
      title: "Echoes of Terra",
      description: "Action RPG where the planet reshapes itself based on your decisions.",
      price: 29.99,
      genre: "RPG",
      coverImageUrl: "https://picsum.photos/seed/echoes-of-terra/640/360",
      releaseDate: new Date("2025-06-12"),
    },
    {
      title: "Dungeon Railway",
      description: "Co-op roguelite where you defend a moving train across haunted tunnels.",
      price: 17.25,
      genre: "Roguelite",
      coverImageUrl: "https://picsum.photos/seed/dungeon-railway/640/360",
      releaseDate: new Date("2025-08-01"),
    },
    {
      title: "Pixel Kingdoms Reborn",
      description: "City-builder with diplomacy, trade routes, and seasonal crises.",
      price: 24.0,
      genre: "Simulation",
      coverImageUrl: "https://picsum.photos/seed/pixel-kingdoms-reborn/640/360",
      releaseDate: new Date("2024-09-15"),
    },
    {
      title: "Void Signal",
      description: "Narrative thriller about recovering a lost colony from deep-space transmissions.",
      price: 21.75,
      genre: "Adventure",
      coverImageUrl: "https://picsum.photos/seed/void-signal/640/360",
      releaseDate: new Date("2025-01-09"),
    },
  ];

  const games = [];
  for (const game of gameCatalog) {
    const created = await prisma.game.create({
      data: {
        ...game,
        developerId,
      },
    });
    games.push(created);
  }

  await prisma.review.createMany({
    data: [
      {
        userId: customerUser.id,
        gameId: games[0].id,
        rating: 5,
        comment: "Very polished tactical combat and great mission variety.",
      },
      {
        userId: adminUser.id,
        gameId: games[1].id,
        rating: 4,
        comment: "Fast and stylish. Good value for the price.",
      },
      {
        userId: customerUser.id,
        gameId: games[2].id,
        rating: 4,
        comment: "Interesting story branches and strong world-building.",
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      {
        wishlistId: customerUser.wishlist!.id,
        gameId: games[3].id,
      },
      {
        wishlistId: customerUser.wishlist!.id,
        gameId: games[5].id,
      },
    ],
  });

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: customerUser.cart!.id,
        gameId: games[0].id,
        quantity: 1,
      },
      {
        cartId: customerUser.cart!.id,
        gameId: games[4].id,
        quantity: 1,
      },
    ],
  });

  await prisma.order.create({
    data: {
      userId: customerUser.id,
      status: "COMPLETED",
      totalAmount: Number((games[1].price + games[2].price).toFixed(2)),
      orderDate: new Date("2026-03-18T09:30:00"),
      items: {
        create: [
          {
            gameId: games[1].id,
            quantity: 1,
          },
          {
            gameId: games[2].id,
            quantity: 1,
          },
        ],
      },
      payment: {
        create: {
          amount: Number((games[1].price + games[2].price).toFixed(2)),
          paymentMethod: "PAYPAL",
          paymentDate: new Date("2026-03-18T09:31:00"),
          status: "SUCCESS",
        },
      },
    },
  });

  await prisma.libraryItem.createMany({
    data: [
      {
        userId: customerUser.id,
        gameId: games[1].id,
        purchasedAt: new Date("2026-03-18T09:31:00"),
      },
      {
        userId: customerUser.id,
        gameId: games[2].id,
        purchasedAt: new Date("2026-03-18T09:31:00"),
      },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
