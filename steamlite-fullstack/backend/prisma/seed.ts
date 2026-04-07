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
    title: "ARC Raiders",
    description: "Extraction shooter built around scavenging dangerous zones, fighting colossal ARC machines, and surviving with your squad.",
    price: 39.99,
    genre: "Extraction Shooter",
    coverImageUrl: "/assets/arc-raiders.jpg",
    releaseDate: "2025-10-30",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Borderlands 4",
    description: "Chaotic co-op looter shooter packed with oversized weapons, outrageous enemies, and long-form build crafting.",
    price: 69.99,
    discountPercent: 10,
    genre: "Looter Shooter",
    coverImageUrl: "/assets/borderlands-4.jpg",
    releaseDate: "2025-09-12",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Crimson Desert",
    description: "Open-world action RPG with large-scale battles, horseback traversal, and cinematic single-player quests.",
    price: 59.99,
    genre: "Action RPG",
    coverImageUrl: "/assets/crimson-desert.jpg",
    releaseDate: "2025-11-14",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Death Stranding 2: On the Beach",
    description: "Cinematic action adventure about reconnecting fractured territories through surreal deliveries and strange encounters.",
    price: 69.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/death-stranding-2.jpg",
    releaseDate: "2025-06-26",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "DOOM: The Dark Ages",
    description: "Heavy-metal first-person shooter that drops the Slayer into a brutal medieval war against hellish armies.",
    price: 69.99,
    genre: "Shooter",
    coverImageUrl: "/assets/doom-the-dark-ages.jpg",
    releaseDate: "2025-05-15",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Fable",
    description: "Fantasy RPG that mixes hero choices, eccentric humor, and story-driven exploration across Albion.",
    price: 69.99,
    genre: "RPG",
    coverImageUrl: "/assets/fable.jpg",
    releaseDate: "2026-10-20",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Ghost of Yotei",
    description: "Open-world samurai action adventure focused on duels, exploration, and a revenge-driven journey across northern Japan.",
    price: 69.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/ghost-of-yotei-2.jpg",
    releaseDate: "2025-10-02",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Grand Theft Auto VI",
    description: "Open-world crime epic centered on heists, city-scale satire, and a pair of protagonists trying to climb the underworld ladder.",
    price: 79.99,
    genre: "Open World Action",
    coverImageUrl: "/assets/gta-6.jpeg",
    releaseDate: "2026-05-26",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Little Nightmares III",
    description: "Co-op horror puzzle-platformer where two children navigate oversized nightmares filled with unsettling creatures.",
    price: 39.99,
    genre: "Horror Puzzle Platformer",
    coverImageUrl: "/assets/little-nightmare-3.jpg",
    releaseDate: "2025-10-10",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Mafia: The Old Country",
    description: "Narrative crime action game exploring organized crime origins with cinematic shootouts and slow-burn family drama.",
    price: 59.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/mafia-the-old-country.jpg",
    releaseDate: "2025-08-08",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Marvel Rivals",
    description: "Fast team-based hero shooter where Marvel characters clash in destructible arenas built around combo-heavy abilities.",
    price: 0,
    genre: "Hero Shooter",
    coverImageUrl: "/assets/marvel-rivals.jpg",
    releaseDate: "2024-12-06",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Metroid Prime 4: Beyond",
    description: "First-person sci-fi action adventure that blends scanning, shooting, and atmospheric world discovery.",
    price: 59.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/metroid-prime-4-beyond.jpg",
    releaseDate: "2025-08-28",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Monster Hunter Wilds",
    description: "Large-scale hunting action RPG with seamless zones, dynamic ecosystems, and elaborate co-op boss encounters.",
    price: 69.99,
    genre: "Action RPG",
    coverImageUrl: "/assets/monster-hunter-wilds.jpg",
    releaseDate: "2025-02-28",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "South of Midnight",
    description: "Southern Gothic action adventure with folklore-inspired creatures, magical weaving powers, and a storybook visual style.",
    price: 49.99,
    discountPercent: 15,
    genre: "Action Adventure",
    coverImageUrl: "/assets/south-of-midnight.jpg",
    releaseDate: "2025-04-08",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Total War: Three Kingdoms",
    description: "Grand strategy campaign set in ancient China with empire management, diplomacy, and massive real-time battles.",
    price: 59.99,
    discountPercent: 20,
    genre: "Strategy",
    coverImageUrl: "/assets/total-war-three-kingdoms.jpg",
    releaseDate: "2019-05-23",
    developerCompany: "Railgun Rabbit",
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
        rating: 4,
        comment: "Strong extraction loop and the ARC fights are genuinely tense with friends.",
      },
      {
        userId: adminUser.id,
        gameId: games[1].id,
        rating: 5,
        comment: "Loot showers, big personalities, and a lot of build variety already.",
      },
      {
        userId: playerOne.id,
        gameId: games[2].id,
        rating: 4,
        comment: "The world looks huge and the melee combat feels way more ambitious than expected.",
      },
      {
        userId: luna.id,
        gameId: games[3].id,
        rating: 5,
        comment: "Beautifully strange and surprisingly emotional even when the gameplay slows down.",
      },
      {
        userId: kai.id,
        gameId: games[0].id,
        rating: 1,
        comment: "trash game, total scam and a waste of time",
      },
      {
        userId: minh.id,
        gameId: games[8].id,
        rating: 4,
        comment: "Creepy co-op puzzles land really well and the art direction is fantastic.",
      },
      {
        userId: iris.id,
        gameId: games[12].id,
        rating: 5,
        comment: "Best hunt roster in the catalog so far and the ecosystem changes keep fights fresh.",
      },
      {
        userId: minh.id,
        gameId: games[10].id,
        rating: 4,
        comment: "Matches are fast and flashy, and team-up abilities make it easy to learn with friends.",
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
