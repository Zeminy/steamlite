import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { calculateDiscountedPrice } from "../src/utils/pricing";
import { calculateRevenueSplit } from "../src/utils/revenue";

const prisma = new PrismaClient();

const hash = (value: string) => bcrypt.hash(value, 10);

type DeveloperSeed = {
  username: string;
  email: string;
  password: string;
  company: string;
  profile: string;
};

type CustomerSeed = {
  username: string;
  email: string;
  password: string;
};

type GameSeed = {
  title: string;
  description: string;
  price: number;
  discountPercent?: number;
  genre: string;
  coverImageUrl: string;
  releaseDate: string;
  developerCompany: string;
};

const developerSeeds: DeveloperSeed[] = [
  {
    username: "devuser",
    email: "dev@steamlite.local",
    password: "Dev123!",
    company: "IndieForge Studio",
    profile: "Focused on story-rich indie games and co-op gameplay.",
  },
  {
    username: "sora",
    email: "sora@steamlite.local",
    password: "Dev123!",
    company: "Aurora Byteworks",
    profile: "Builds polished action-adventure games with vibrant worlds.",
  },
  {
    username: "marco",
    email: "marco@steamlite.local",
    password: "Dev123!",
    company: "Railgun Rabbit",
    profile: "Creates fast arcade titles and replayable roguelites.",
  },
];

const customerSeeds: CustomerSeed[] = [
  {
    username: "playerone",
    email: "user@steamlite.local",
    password: "User123!",
  },
  {
    username: "luna",
    email: "luna@steamlite.local",
    password: "User123!",
  },
  {
    username: "kai",
    email: "kai@steamlite.local",
    password: "User123!",
  },
  {
    username: "minh",
    email: "minh@steamlite.local",
    password: "User123!",
  },
  {
    username: "iris",
    email: "iris@steamlite.local",
    password: "User123!",
  },
];

const gameSeeds: GameSeed[] = [
  {
    title: "Skybreak Tactics",
    description: "Turn-based sci-fi strategy with modular squads and orbital support.",
    price: 19.99,
    genre: "Strategy",
    coverImageUrl: "https://picsum.photos/seed/skybreak-tactics/640/360",
    releaseDate: "2025-02-18",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Neon Drifter",
    description: "Arcade racing through cyberpunk cities with upgradeable hover cars.",
    price: 14.5,
    discountPercent: 15,
    genre: "Racing",
    coverImageUrl: "https://picsum.photos/seed/neon-drifter/640/360",
    releaseDate: "2024-11-03",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Echoes of Terra",
    description: "Action RPG where the planet reshapes itself based on your decisions.",
    price: 29.99,
    genre: "RPG",
    coverImageUrl: "https://picsum.photos/seed/echoes-of-terra/640/360",
    releaseDate: "2025-06-12",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Dungeon Railway",
    description: "Co-op roguelite where you defend a moving train across haunted tunnels.",
    price: 17.25,
    genre: "Roguelite",
    coverImageUrl: "https://picsum.photos/seed/dungeon-railway/640/360",
    releaseDate: "2025-08-01",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Pixel Kingdoms Reborn",
    description: "City-builder with diplomacy, trade routes, and seasonal crises.",
    price: 24.0,
    genre: "Simulation",
    coverImageUrl: "https://picsum.photos/seed/pixel-kingdoms-reborn/640/360",
    releaseDate: "2024-09-15",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Void Signal",
    description: "Narrative thriller about recovering a lost colony from deep-space transmissions.",
    price: 21.75,
    genre: "Adventure",
    coverImageUrl: "https://picsum.photos/seed/void-signal/640/360",
    releaseDate: "2025-01-09",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Crimson Harbor",
    description: "Story-heavy detective mystery set in a flooded trade city with faction politics.",
    price: 22.99,
    genre: "Adventure",
    coverImageUrl: "https://picsum.photos/seed/crimson-harbor/640/360",
    releaseDate: "2025-03-11",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Mecha Relay",
    description: "Competitive sports-action game where teams race giant mechs through hazardous arenas.",
    price: 18.5,
    genre: "Action",
    coverImageUrl: "https://picsum.photos/seed/mecha-relay/640/360",
    releaseDate: "2024-10-21",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Moon Orchard",
    description: "Relaxed farming sim on a lunar colony with modular greenhouse systems.",
    price: 16.99,
    discountPercent: 20,
    genre: "Simulation",
    coverImageUrl: "https://picsum.photos/seed/moon-orchard/640/360",
    releaseDate: "2025-04-08",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Frostline Protocol",
    description: "Squad shooter with stealth gadgets and dynamic weather on an arctic front.",
    price: 26.99,
    genre: "Shooter",
    coverImageUrl: "https://picsum.photos/seed/frostline-protocol/640/360",
    releaseDate: "2025-07-19",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Threads of Sol",
    description: "Emotional puzzle-platformer about repairing a dying sun through woven timelines.",
    price: 13.25,
    discountPercent: 10,
    genre: "Puzzle",
    coverImageUrl: "https://picsum.photos/seed/threads-of-sol/640/360",
    releaseDate: "2024-08-12",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Warden's Ascent",
    description: "Dark fantasy metroidvania with chained movement combos and towering castle routes.",
    price: 27.5,
    genre: "Action",
    coverImageUrl: "https://picsum.photos/seed/wardens-ascent/640/360",
    releaseDate: "2025-05-02",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Drift Colony",
    description: "Base-building survival game set across moving asteroid platforms.",
    price: 23.99,
    genre: "Strategy",
    coverImageUrl: "https://picsum.photos/seed/drift-colony/640/360",
    releaseDate: "2025-09-06",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Signal Breakers",
    description: "Tactical co-op breach missions where players disable rogue AI relay towers.",
    price: 20.0,
    genre: "Strategy",
    coverImageUrl: "https://picsum.photos/seed/signal-breakers/640/360",
    releaseDate: "2025-02-28",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Lantern Vale",
    description: "Exploration RPG through villages haunted by memories trapped in magical lanterns.",
    price: 25.49,
    genre: "RPG",
    coverImageUrl: "https://picsum.photos/seed/lantern-vale/640/360",
    releaseDate: "2024-12-14",
    developerCompany: "Aurora Byteworks",
  },
];

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

  const developers = [];
  for (const seed of developerSeeds) {
    const developerUser = await prisma.user.create({
      data: {
        username: seed.username,
        email: seed.email,
        password: await hash(seed.password),
        role: "DEVELOPER",
        cart: { create: {} },
        wishlist: { create: {} },
        developer: {
          create: {
            company: seed.company,
            profile: seed.profile,
          },
        },
      },
      include: {
        developer: true,
        cart: true,
        wishlist: true,
      },
    });

    developers.push(developerUser);
  }

  const customers = [];
  for (const seed of customerSeeds) {
    const customerUser = await prisma.user.create({
      data: {
        username: seed.username,
        email: seed.email,
        password: await hash(seed.password),
        role: "CUSTOMER",
        cart: { create: {} },
        wishlist: { create: {} },
      },
      include: {
        cart: true,
        wishlist: true,
      },
    });

    customers.push(customerUser);
  }

  const developerIdByCompany = new Map(
    developers.map((developer) => [developer.developer!.company, developer.developer!.id])
  );

  const games = [];
  for (const seed of gameSeeds) {
    const developerId = developerIdByCompany.get(seed.developerCompany);

    if (!developerId) {
      throw new Error(`Developer company not found for game seed: ${seed.title}`);
    }

    const created = await prisma.game.create({
      data: {
        title: seed.title,
        description: seed.description,
        price: seed.price,
        discountPercent: seed.discountPercent || 0,
        genre: seed.genre,
        coverImageUrl: seed.coverImageUrl,
        releaseDate: new Date(seed.releaseDate),
        developerId,
      },
    });

    games.push(created);
  }

  const [playerOne, luna, kai, minh, iris] = customers;

  await prisma.review.createMany({
    data: [
      {
        userId: playerOne.id,
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
        userId: playerOne.id,
        gameId: games[2].id,
        rating: 4,
        comment: "Interesting story branches and strong world-building.",
      },
      {
        userId: luna.id,
        gameId: games[6].id,
        rating: 5,
        comment: "One of the strongest narrative games in the catalog.",
      },
      {
        userId: kai.id,
        gameId: games[7].id,
        rating: 4,
        comment: "Fast, chaotic, and fun with friends.",
      },
      {
        userId: minh.id,
        gameId: games[8].id,
        rating: 4,
        comment: "Relaxing progression loop and satisfying upgrades.",
      },
      {
        userId: iris.id,
        gameId: games[11].id,
        rating: 5,
        comment: "Tight combat and memorable level design.",
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      { wishlistId: playerOne.wishlist!.id, gameId: games[3].id },
      { wishlistId: playerOne.wishlist!.id, gameId: games[5].id },
      { wishlistId: luna.wishlist!.id, gameId: games[10].id },
      { wishlistId: kai.wishlist!.id, gameId: games[12].id },
      { wishlistId: minh.wishlist!.id, gameId: games[14].id },
      { wishlistId: iris.wishlist!.id, gameId: games[4].id },
    ],
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: playerOne.cart!.id, gameId: games[0].id, quantity: 1 },
      { cartId: playerOne.cart!.id, gameId: games[4].id, quantity: 1 },
      { cartId: luna.cart!.id, gameId: games[6].id, quantity: 1 },
      { cartId: kai.cart!.id, gameId: games[9].id, quantity: 1 },
      { cartId: minh.cart!.id, gameId: games[13].id, quantity: 1 },
    ],
  });

  const completedOrders = [
    {
      userId: playerOne.id,
      gameIndexes: [1, 2],
      paymentMethod: "PAYPAL",
      orderDate: new Date("2026-03-18T09:30:00"),
    },
    {
      userId: luna.id,
      gameIndexes: [6, 8],
      paymentMethod: "CREDIT_CARD",
      orderDate: new Date("2026-03-20T15:10:00"),
    },
    {
      userId: kai.id,
      gameIndexes: [7],
      paymentMethod: "MOMO",
      orderDate: new Date("2026-03-23T19:45:00"),
    },
    {
      userId: minh.id,
      gameIndexes: [11, 14],
      paymentMethod: "BANK_TRANSFER",
      orderDate: new Date("2026-03-24T21:05:00"),
    },
  ];

  for (const orderSeed of completedOrders) {
    const selectedGames = orderSeed.gameIndexes.map((index) => games[index]);
    const totalAmount = Number(
      selectedGames
        .reduce((sum, game) => sum + calculateDiscountedPrice(game.price, game.discountPercent || 0).finalPrice, 0)
        .toFixed(2)
    );
    const revenueSplit = calculateRevenueSplit(totalAmount);

    await prisma.order.create({
      data: {
        userId: orderSeed.userId,
        status: "COMPLETED",
        totalAmount,
        platformRevenue: revenueSplit.platformRevenue,
        developerRevenue: revenueSplit.developerRevenue,
        commissionRate: revenueSplit.commissionRate,
        orderDate: orderSeed.orderDate,
        items: {
          create: selectedGames.map((game) => {
            const pricing = calculateDiscountedPrice(game.price, game.discountPercent || 0);

            return {
              gameId: game.id,
              quantity: 1,
              baseUnitPrice: pricing.basePrice,
              discountPercent: pricing.discountPercent,
              finalUnitPrice: pricing.finalPrice,
            };
          }),
        },
        payment: {
          create: {
            amount: totalAmount,
            paymentMethod: orderSeed.paymentMethod,
            paymentDate: new Date(orderSeed.orderDate.getTime() + 60 * 1000),
            status: "SUCCESS",
          },
        },
      },
    });

    await prisma.libraryItem.createMany({
      data: selectedGames.map((game) => ({
        userId: orderSeed.userId,
        gameId: game.id,
        purchasedAt: new Date(orderSeed.orderDate.getTime() + 60 * 1000),
      })),
    });
  }

  console.log("Seed completed with 1 admin, 3 developers, 5 customers, and 15 games.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
