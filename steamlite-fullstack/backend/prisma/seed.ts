import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { calculateDiscountedPrice } from "../src/utils/pricing";
import { calculateRevenueSplit } from "../src/utils/revenue";

const prisma: any = new PrismaClient();

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
  {
    username: "alex",
    email: "alex@steamlite.local",
    password: "User123!",
  },
  {
    username: "sam",
    email: "sam@steamlite.local",
    password: "User123!",
  },
  {
    username: "robin",
    email: "robin@steamlite.local",
    password: "User123!",
  },
  {
    username: "morgan",
    email: "morgan@steamlite.local",
    password: "User123!",
  },
  {
    username: "taylor",
    email: "taylor@steamlite.local",
    password: "User123!",
  },
];

const positiveComments = [
  "Absolutely incredible! The best game I've played this year.",
  "10/10 would play again. Masterpiece.",
  "Stunning visuals and the gameplay is so smooth.",
  "I can't put this down. Just one more hour...",
  "Valve/Dev really outdid themselves this time.",
  "Highly recommend to anyone who likes this genre.",
  "A breath of fresh air in the gaming industry.",
  "Worth every penny, even at full price.",
  "The music alone is worth the price of admission.",
  "Finally a game that respects my time.",
];

const neutralComments = [
  "It's okay, nothing groundbreaking but solid.",
  "A decent experience. Has some flaws but enjoyable.",
  "Average game. Good for a weekend play.",
  "I liked parts of it, but other parts were frustrating.",
  "Not bad, not great. Just okay.",
  "Wait for a sale, but it's worth playing eventually.",
  "Interesting ideas but the execution is a bit hit or miss.",
  "A bit repetitive after a while, but fine in small doses.",
];

const negativeComments = [
  "Boring and repetitive. I lost interest after 2 hours.",
  "Way too many bugs. Feels like an early access title.",
  "Disappointing. I expected much more from this team.",
  "Broken mechanics and terrible optimization.",
  "Too grindy for my taste. Feels like a chore.",
  "The story makes no sense and the characters are flat.",
  "Overpriced for the amount of content you get.",
  "I regret buying this. Refunded within an hour.",
];

const toxicComments = [
  "This game is literal TRASH. Garbage devs.",
  "SCAM! Do not buy this fraud of a game.",
  "Complete idiot design. Total waste of my life.",
  "I HATE EVERYTHING ABOUT THIS. Delete this garbage.",
  "STUPID mechanics, STUPID story. Garbage garbage garbage.",
  "Liars! They promised features that aren't even here.",
  "Kill me now, this is the worst thing I've ever seen.",
  "Toxic community and toxic game. Avoid like the plague.",
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
  {
    title: "Half-Life 3",
    description: "The long-awaited continuation of the Freeman saga. Gravity-defying physics and reality-bending narrative.",
    price: 69.99,
    genre: "FPS",
    coverImageUrl: "/assets/half-life-3.jpeg",
    releaseDate: "2026-11-16",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Persona 5 Royal",
    description: "A stylish JRPG about high schoolers by day and phantom thieves by night, fighting corruption in society.",
    price: 59.99,
    genre: "JRPG",
    coverImageUrl: "/assets/persona-5-royal.jpg",
    releaseDate: "2020-03-31",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Balatro",
    description: "A poker-themed roguelike deckbuilder where you create powerful synergies and lead illegal poker hands.",
    price: 14.99,
    genre: "Roguelike",
    coverImageUrl: "/assets/balatro.jpg",
    releaseDate: "2024-02-20",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Minecraft",
    description: "The ultimate sandbox experience. Build anything you can imagine in a blocky, procedurally generated world.",
    price: 29.99,
    genre: "Sandbox",
    coverImageUrl: "/assets/minecraft.jpg",
    releaseDate: "2011-11-18",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Among Us",
    description: "Trust no one. Uncover the imposter in this social deduction game set in space.",
    price: 4.99,
    genre: "Social Deduction",
    coverImageUrl: "/assets/among-us.jpg",
    releaseDate: "2018-11-16",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Angry Birds",
    description: "Use the unique powers of the Angry Birds to destroy the greedy pigs' defenses!",
    price: 0.99,
    genre: "Puzzle",
    coverImageUrl: "/assets/angry-birds.jpg",
    releaseDate: "2009-12-11",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "EA Sports FC 26",
    description: "The world's game. Experience the most realistic football experience with updated rosters and HyperMotion technology.",
    price: 69.99,
    genre: "Sports",
    coverImageUrl: "/assets/ea-sports-fc-26.jpg",
    releaseDate: "2025-09-26",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "EA Sports Madden NFL 26",
    description: "Gridiron greatness. Lead your team to Super Bowl glory with improved AI and franchise mode.",
    price: 69.99,
    genre: "Sports",
    coverImageUrl: "/assets/ea-sports-madden-nfl-26.jpg",
    releaseDate: "2025-08-15",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Fallout 76",
    description: "Reclaim the wasteland. Explore a post-nuclear Appalachia with friends in this open-world multiplayer RPG.",
    price: 39.99,
    genre: "Open World RPG",
    coverImageUrl: "/assets/fallout-76.jpg",
    releaseDate: "2018-11-14",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Flappy Bird",
    description: "Tap to fly and avoid the pipes. The simple yet addictive challenge that took the world by storm.",
    price: 0,
    genre: "Arcade",
    coverImageUrl: "/assets/flappy-bird.png",
    releaseDate: "2013-05-24",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Fortnite",
    description: "The ultimate battle royale. Build, fight, and create in a constantly evolving world.",
    price: 0,
    genre: "Battle Royale",
    coverImageUrl: "/assets/fortdey.jpg",
    releaseDate: "2017-07-21",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Doki Doki Literature Club!",
    description: "Welcome to the literature club! A visual novel that isn't exactly what it seems.",
    price: 0,
    genre: "Psychological Horror",
    coverImageUrl: "/assets/loki-loki-literature-club.jpg",
    releaseDate: "2017-09-22",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Mortal Kombat 1",
    description: "It's in our blood. Discover a reborn Mortal Kombat Universe created by the Fire God Liu Kang.",
    price: 69.99,
    genre: "Fighting",
    coverImageUrl: "/assets/mortal-kombat-1.jpg",
    releaseDate: "2023-09-19",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "NBA 2K26",
    description: "Dominate the court. Experience true-to-life gameplay and deep customization in the ultimate basketball sim.",
    price: 69.99,
    genre: "Sports",
    coverImageUrl: "/assets/nba-2k26.jpg",
    releaseDate: "2025-09-05",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Outlast",
    description: "Hell is an experiment you can't survive. A first-person survival horror game set in a remote asylum.",
    price: 19.99,
    genre: "Survival Horror",
    coverImageUrl: "/assets/outlast.jpg",
    releaseDate: "2013-09-04",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Plants vs. Zombies",
    description: "Get ready to soil your plants! Defend your home against a mob of fun-loving zombies.",
    price: 4.99,
    genre: "Tower Defense",
    coverImageUrl: "/assets/plants-vs-zombies.jpg",
    releaseDate: "2009-05-05",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Poppy Playtime",
    description: "Explore the abandoned toy factory. Can you escape the vengeful toys lurking in the shadows?",
    price: 9.99,
    genre: "Horror",
    coverImageUrl: "/assets/poppy-playtime.jpg",
    releaseDate: "2021-10-12",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Resident Evil 7: Biohazard",
    description: "Fear comes home. A survival horror experience that shifts the series to a terrifying first-person perspective.",
    price: 19.99,
    genre: "Survival Horror",
    coverImageUrl: "/assets/resident-evil-7-biohazard.jpg",
    releaseDate: "2017-01-24",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Subnautica",
    description: "Descend into the depths of an alien underwater world. Craft, explore, and survive in the vast ocean.",
    price: 29.99,
    genre: "Survival Adventure",
    coverImageUrl: "/assets/subnautica.jpg",
    releaseDate: "2018-01-23",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Terraria",
    description: "Dig, fight, explore, build! The world is at your fingertips in this action-packed sandbox adventure.",
    price: 9.99,
    genre: "Sandbox RPG",
    coverImageUrl: "/assets/terraria.jpg",
    releaseDate: "2011-05-16",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "The Elder Scrolls VI",
    description: "Return to Tamriel. The next chapter in the legendary open-world RPG series from Bethesda Game Studios.",
    price: 69.99,
    genre: "Open World RPG",
    coverImageUrl: "/assets/the-elder-scrolls-vi-earthring.jpg",
    releaseDate: "2026-11-11",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Trackmania",
    description: "Race to the top. The ultimate stunt racing experience where creativity meets speed.",
    price: 0,
    genre: "Racing",
    coverImageUrl: "/assets/trackmania.jpg",
    releaseDate: "2020-07-01",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Yakuza: Like a Dragon",
    description: "Rise like a dragon. An explosive RPG that follows a new protagonist in a vibrant, modern-day Japan.",
    price: 59.99,
    genre: "RPG",
    coverImageUrl: "/assets/yakuza-like-a-dragon.jpg",
    releaseDate: "2020-11-10",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Counter-Strike: Global Offensive",
    description: "Tactical team-based combat. The definitive competitive first-person shooter.",
    price: 0,
    genre: "Tactical FPS",
    coverImageUrl: "/assets/counter-strike-global-offensive.webp",
    releaseDate: "2012-08-21",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Uma Musume: Handsome Derby",
    description: "Train your horse girls to victory! A unique simulation and racing game with a heavy focus on story.",
    price: 0,
    genre: "Simulation",
    coverImageUrl: "/assets/umamusuko-handsome-derby.webp",
    releaseDate: "2021-02-24",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "No Man's Sky",
    description: "Explore an infinite universe. A galaxy of unique planets and lifeforms awaits discovery.",
    price: 59.99,
    genre: "Space Exploration",
    coverImageUrl: "/assets/all-womens-sky.jpg",
    releaseDate: "2016-08-09",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Chiaroscuro Excursion",
    description: "A visually stunning journey through light and shadow. Solve puzzles and uncover ancient secrets.",
    price: 19.99,
    genre: "Puzzle Platformer",
    coverImageUrl: "/assets/chiaroscuro-excursion-36.jpg",
    releaseDate: "2025-12-12",
    developerCompany: "IndieForge Studio",
  },
  {
    title: "Sunmoist Canyon",
    description: "Survive the desert heat. Explore a vast, arid canyon filled with mystery and danger.",
    price: 24.99,
    genre: "Survival",
    coverImageUrl: "/assets/sunmoist-canyon.jpg",
    releaseDate: "2026-06-01",
    developerCompany: "Aurora Byteworks",
  },
  {
    title: "Danganronpa: Trigger Happy Havoc",
    description: "Hope meets despair. Solve the murders and survive the high-stakes game of life and death.",
    price: 19.99,
    genre: "Visual Novel",
    coverImageUrl: "/assets/danganronpa-trigger-happy-havoc.jpg",
    releaseDate: "2010-11-25",
    developerCompany: "Railgun Rabbit",
  },
  {
    title: "Counter-Strike: Tactical Operations",
    description: "The next evolution of tactical combat. Real-world scenarios, advanced weaponry, and deep strategic depth.",
    price: 14.99,
    genre: "Tactical FPS",
    coverImageUrl: "/assets/counter-strike-strategic-tactical-operations-platform.jpg",
    releaseDate: "2025-05-05",
    developerCompany: "Aurora Byteworks",
  },
];

async function main() {
  await prisma.$transaction([
    prisma.emailDelivery.deleteMany(),
    prisma.pendingRegistration.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.libraryItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.game.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.developer.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.user.deleteMany(),
  ]);

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

  // --- Dynamic Review Generation (10+ per game) ---
  const allReviewers = [...customers]; // Exclude adminUser to avoid self-moderation confusion
  const reviewsData: any[] = [];

  for (const game of games) {
    // Each game gets reviews from most of the reviewers (to reach ~10)
    const shuffledReviewers = [...allReviewers].sort(() => Math.random() - 0.5);
    
    shuffledReviewers.forEach((user, index) => {
      let rating = 5;
      let comment = "";

      // Distribute sentiment: 50% Positive, 25% Neutral, 15% Negative, 10% Toxic/Flagged
      const roll = Math.random();
      if (roll < 0.5) {
        rating = 4 + Math.floor(Math.random() * 2); // 4 or 5
        comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];
      } else if (roll < 0.75) {
        rating = 3;
        comment = neutralComments[Math.floor(Math.random() * neutralComments.length)];
      } else if (roll < 0.9) {
        rating = 1 + Math.floor(Math.random() * 2); // 1 or 2
        comment = negativeComments[Math.floor(Math.random() * negativeComments.length)];
      } else {
        // Toxic/Flagged case
        rating = 1;
        const toxicRoll = Math.random();
        if (toxicRoll < 0.7) {
          comment = toxicComments[Math.floor(Math.random() * toxicComments.length)];
        } else {
          comment = ""; // Low rating with no comment (also flagged)
        }
      }

      reviewsData.push({
        userId: user.id,
        gameId: game.id,
        rating,
        comment,
      });
    });
  }

  await prisma.review.createMany({
    data: reviewsData,
  });

  // --- Initial Store Interactions ---
  await prisma.wishlistItem.createMany({
    data: [
      { wishlistId: customers[0].wishlist!.id, gameId: games[3].id },
      { wishlistId: customers[0].wishlist!.id, gameId: games[5].id },
      { wishlistId: customers[1].wishlist!.id, gameId: games[10].id },
      { wishlistId: customers[2].wishlist!.id, gameId: games[12].id },
    ],
  });

  const completedOrders = [
    {
      userId: customers[0].id,
      gameIndexes: [1, 2, 15, 35],
      paymentMethod: "PAYPAL",
      orderDate: new Date("2026-03-18T09:30:00"),
    },
    {
      userId: customers[1].id,
      gameIndexes: [6, 8],
      paymentMethod: "CREDIT_CARD",
      orderDate: new Date("2026-03-20T15:10:00"),
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
    const user = customers.find((c) => c.id === orderSeed.userId);

    const order = await prisma.order.create({
      data: {
        userId: orderSeed.userId,
        receiptEmail: user?.email || "receipt@steamlite.local",
        confirmationCode: `SL-SEED-${orderSeed.userId}-${Date.now()}`,
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
            status: "SUCCESS",
          },
        },
      },
    });

    await prisma.libraryItem.createMany({
      data: selectedGames.map((game) => ({
        userId: orderSeed.userId,
        gameId: game.id,
      })),
    });
  }

  console.log(`Seed completed with 1 admin, 3 developers, ${customers.length} customers, and ${games.length} games.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
