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
        userId: luna.id,
        gameId: games[0].id,
        rating: 5,
        comment: "Absolutely loving the atmosphere! It's spooky and satisfying at the same time.",
      },
      {
        userId: kai.id,
        gameId: games[0].id,
        rating: 2,
        comment: "Optimization is a nightmare. I can barely run it on a 3080. Disappointing.",
      },
      {
        userId: adminUser.id,
        gameId: games[1].id,
        rating: 5,
        comment: "Loot showers, big personalities, and a lot of build variety already.",
      },
      {
        userId: minh.id,
        gameId: games[1].id,
        rating: 3,
        comment: "It's fun, but feels like more of the same. Not really a huge leap from BL3.",
      },
      {
        userId: playerOne.id,
        gameId: games[2].id,
        rating: 4,
        comment: "The world looks huge and the melee combat feels way more ambitious than expected.",
      },
      {
        userId: iris.id,
        gameId: games[2].id,
        rating: 5,
        comment: "Masterpiece in the making. The environmental storytelling is top-notch.",
      },
      {
        userId: luna.id,
        gameId: games[3].id,
        rating: 5,
        comment: "Beautifully strange and surprisingly emotional even when the gameplay slows down.",
      },
      {
        userId: kai.id,
        gameId: games[3].id,
        rating: 4,
        comment: "A bit slow for some, but I appreciate the artistic direction and pacing.",
      },
      {
        userId: kai.id,
        gameId: games[4].id,
        rating: 5,
        comment: "Rip and tear! This medieval setting is exactly what the franchise needed.",
      },
      {
        userId: minh.id,
        gameId: games[4].id,
        rating: 2,
        comment: "I prefer the sci-fi setting. This feels a bit too generic fantasy for DOOM.",
      },
      {
        userId: playerOne.id,
        gameId: games[15].id,
        rating: 5,
        comment: "IT'S FINALLY HERE AND IT'S PERFECT! Valve really outdid themselves.",
      },
      {
        userId: luna.id,
        gameId: games[15].id,
        rating: 5,
        comment: "I've waited 20 years for this and I'm not crying, you're crying.",
      },
      {
        userId: iris.id,
        gameId: games[16].id,
        rating: 5,
        comment: "Style, music, and gameplay are all 10/10. Royal really adds so much content.",
      },
      {
        userId: kai.id,
        gameId: games[16].id,
        rating: 4,
        comment: "Great JRPG, although the social links can get a bit grindy after 80 hours.",
      },
      {
        userId: minh.id,
        gameId: games[17].id,
        rating: 5,
        comment: "This game ruined my sleep schedule. Just one more run...",
      },
      {
        userId: playerOne.id,
        gameId: games[17].id,
        rating: 4,
        comment: "Brilliant mechanics. Simple to learn but incredibly deep once you unlock jokers.",
      },
      {
        userId: iris.id,
        gameId: games[18].id,
        rating: 5,
        comment: "The ultimate creative outlet. My kids and I have spent hundreds of hours building.",
      },
      {
        userId: kai.id,
        gameId: games[18].id,
        rating: 2,
        comment: "I don't get the hype. It's just blocks? Not enough direction for me.",
      },
      {
        userId: minh.id,
        gameId: games[8].id,
        rating: 5,
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
      {
        userId: playerOne.id,
        gameId: games[7].id,
        rating: 5,
        comment: "Wait, is it 2026 already? This game is going to break the internet.",
      },
      {
        userId: kai.id,
        gameId: games[7].id,
        rating: 1,
        comment: "Overhyped and overpriced. The satire is getting stale.",
      },
      {
        userId: minh.id,
        gameId: games[19].id,
        rating: 5,
        comment: "Suspiciously addictive. I spent 4 hours today just being a bean in space.",
      },
      {
        userId: iris.id,
        gameId: games[20].id,
        rating: 4,
        comment: "Classic fun. My niece loves it, and honestly, so do I.",
      },
      {
        userId: playerOne.id,
        gameId: games[21].id,
        rating: 3,
        comment: "The Microtransactions are a bit much, but the core football is still solid.",
      },
      {
        userId: luna.id,
        gameId: games[23].id,
        rating: 2,
        comment: "Still buggy after all these years. Appalachia deserved better.",
      },
      {
        userId: kai.id,
        gameId: games[25].id,
        rating: 5,
        comment: "The only battle royale that keeps me coming back. The events are insane.",
      },
      {
        userId: minh.id,
        gameId: games[26].id,
        rating: 5,
        comment: "I came for the cute girls, I stayed for the psychological trauma. 10/10.",
      },
      {
        userId: iris.id,
        gameId: games[27].id,
        rating: 4,
        comment: "Brutal finishers and great graphics. The story is surprisingly engaging too.",
      },
      {
        userId: playerOne.id,
        gameId: games[29].id,
        rating: 5,
        comment: "I haven't felt this genuinely terrified in a game for a long time. Masterful horror.",
      },
      {
        userId: luna.id,
        gameId: games[30].id,
        rating: 5,
        comment: "Relaxing and charming. A great game to unwind with after a stressful day.",
      },
      {
        userId: kai.id,
        gameId: games[32].id,
        rating: 5,
        comment: "The atmosphere is suffocating in the best way possible. A survival horror classic.",
      },
      {
        userId: minh.id,
        gameId: games[33].id,
        rating: 5,
        comment: "Exploring the ocean depths is both beautiful and terrifying. One of my favorites.",
      },
      {
        userId: iris.id,
        gameId: games[34].id,
        rating: 5,
        comment: "Infinite possibilities. I've built a literal castle and a subterranean base.",
      },
      {
        userId: playerOne.id,
        gameId: games[35].id,
        rating: 5,
        comment: "The scale of this world is staggering. I can't wait to see more of Tamriel.",
      },
      {
        userId: luna.id,
        gameId: games[37].id,
        rating: 5,
        comment: "The shift to turn-based combat was a bold move, and it paid off brilliantly. hilarious writing.",
      },
      {
        userId: kai.id,
        gameId: games[38].id,
        rating: 5,
        comment: "Cyka Blyat! Just kidding, this game is the pinnacle of competitive shooters.",
      },
      {
        userId: minh.id,
        gameId: games[40].id,
        rating: 5,
        comment: "The most ambitious redemption story in gaming history. From launch failure to a true masterpiece.",
      },
      {
        userId: playerOne.id,
        gameId: games[5].id,
        rating: 4,
        comment: "Classic Fable charm. The humor is still there and the choices feel impactful.",
      },
      {
        userId: luna.id,
        gameId: games[6].id,
        rating: 5,
        comment: "Ghost of Tsushima was incredible, and this looks even better. The setting is breathtaking.",
      },
      {
        userId: kai.id,
        gameId: games[9].id,
        rating: 4,
        comment: "A solid return to the roots of the series. The atmosphere of old-school Sicily is perfect.",
      },
      {
        userId: minh.id,
        gameId: games[11].id,
        rating: 5,
        comment: "The scanning and exploration are just as good as I remember. Samus is back!",
      },
      {
        userId: iris.id,
        gameId: games[13].id,
        rating: 4,
        comment: "Unique art style and very atmospheric. The Southern Gothic vibes are spot on.",
      },
      {
        userId: playerOne.id,
        gameId: games[14].id,
        rating: 5,
        comment: "The best Total War in years. The character-driven mechanics add so much depth.",
      },
      {
        userId: luna.id,
        gameId: games[22].id,
        rating: 3,
        comment: "Better than last year, but still some legacy issues. Franchise mode needs more work.",
      },
      {
        userId: kai.id,
        gameId: games[24].id,
        rating: 5,
        comment: "Pain. Suffering. Addiction. 10/10.",
      },
      {
        userId: minh.id,
        gameId: games[28].id,
        rating: 3,
        comment: "The gameplay is the best it's ever been, but the VC grind is worse than ever.",
      },
      {
        userId: iris.id,
        gameId: games[31].id,
        rating: 4,
        comment: "Scary and creative. Huggy Wuggy is nightmare fuel.",
      },
      {
        userId: playerOne.id,
        gameId: games[36].id,
        rating: 5,
        comment: "The most satisfying racing game. Building your own tracks is so much fun.",
      },
      {
        userId: luna.id,
        gameId: games[39].id,
        rating: 5,
        comment: "I never thought I'd be this into horse racing anime girls, but here I am.",
      },
      {
        userId: kai.id,
        gameId: games[41].id,
        rating: 4,
        comment: "Beautiful use of lighting. A very chill and thought-provoking experience.",
      },
      {
        userId: minh.id,
        gameId: games[42].id,
        rating: 4,
        comment: "Hardcore survival that actually feels rewarding. The desert is a harsh mistress.",
      },
      {
        userId: iris.id,
        gameId: games[43].id,
        rating: 5,
        comment: "The mystery kept me guessing until the very end. Monokuma is iconic.",
      },
      {
        userId: adminUser.id,
        gameId: games[44].id,
        rating: 5,
        comment: "The absolute peak of tactical shooters. Nothing else compares to the tension.",
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
      gameIndexes: [1, 2, 15, 35],
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
    const receiptEmail = customers.find((customer) => customer.id === orderSeed.userId)?.email;
    const confirmationCode = `SL-SEED-${orderSeed.userId}-${orderSeed.orderDate.getTime()}`;
    const confirmedAt = new Date(orderSeed.orderDate.getTime() + 60 * 1000);
    const user = customers.find((customer) => customer.id === orderSeed.userId);

    const order = await prisma.order.create({
      data: {
        userId: orderSeed.userId,
        receiptEmail: receiptEmail || "receipt@steamlite.local",
        confirmationCode,
        confirmedAt,
        confirmationSentAt: confirmedAt,
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
            paymentDate: confirmedAt,
            status: "SUCCESS",
          },
        },
      },
    });

    await prisma.emailDelivery.create({
      data: {
        userId: user?.id || null,
        orderId: order.id,
        recipient: receiptEmail || "receipt@steamlite.local",
        subject: `SteamLite order #${order.id} confirmed`,
        template: "ORDER_CONFIRMATION",
        bodyText: `Thanks for your purchase. Order #${order.id} has been confirmed.`,
        status: "SIMULATED",
        provider: "APP_PREVIEW",
        sentAt: confirmedAt,
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

  console.log(`Seed completed with 1 admin, 3 developers, 5 customers, and ${games.length} games.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
