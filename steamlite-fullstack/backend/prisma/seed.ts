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
    username: "gears",
    email: "contact@gears.local",
    password: "Dev123!",
    company: ".Gears",
    profile: "Independent game developer known for Flappy Bird.",
  },
  {
    username: "2k",
    email: "contact@2k.local",
    password: "Dev123!",
    company: "2K",
    profile: "Global developer and publisher of interactive entertainment.",
  },
  {
    username: "abstraction",
    email: "contact@abstraction.local",
    password: "Dev123!",
    company: "Abstraction Games",
    profile: "Creative developer focused on porting and co-development.",
  },
  {
    username: "bandainamco",
    email: "contact@bandainamco.local",
    password: "Dev123!",
    company: "Bandai Namco Entertainment",
    profile: "Japanese multinational video game publisher.",
  },
  {
    username: "bethesda",
    email: "contact@bethesda.local",
    password: "Dev123!",
    company: "Bethesda Softworks",
    profile: "Developer of iconic franchises like The Elder Scrolls and Fallout.",
  },
  {
    username: "capcom",
    email: "contact@capcom.local",
    password: "Dev123!",
    company: "CAPCOM Co., Ltd.",
    profile: "Pioneer in the survival horror and action genres.",
  },
  {
    username: "ea",
    email: "contact@ea.local",
    password: "Dev123!",
    company: "Electronic Arts",
    profile: "One of the world's largest video game publishers.",
  },
  {
    username: "embark",
    email: "contact@embark.local",
    password: "Dev123!",
    company: "Embark Studios",
    profile: "Stockholm-based studio creating the next generation of games.",
  },
  {
    username: "epic",
    email: "contact@epic.local",
    password: "Dev123!",
    company: "Epic Games",
    profile: "Creator of Fortnite and the Unreal Engine.",
  },
  {
    username: "hello",
    email: "contact@hello.local",
    password: "Dev123!",
    company: "Hello Games",
    profile: "Independent studio behind No Man's Sky.",
  },
  {
    username: "innersloth",
    email: "contact@innersloth.local",
    password: "Dev123!",
    company: "Innersloth",
    profile: "Small team behind the viral hit Among Us.",
  },
  {
    username: "kepler",
    email: "contact@kepler.local",
    password: "Dev123!",
    company: "Kepler Interactive",
    profile: "The first global publisher co-owned and run by developers.",
  },
  {
    username: "kojima",
    email: "contact@kojima.local",
    password: "Dev123!",
    company: "KOJIMA PRODUCTIONS",
    profile: "Independent studio led by Hideo Kojima.",
  },
  {
    username: "mob",
    email: "contact@mob.local",
    password: "Dev123!",
    company: "Mob Entertainment",
    profile: "Creator of Poppy Playtime and horror experiences.",
  },
  {
    username: "mojang",
    email: "contact@mojang.local",
    password: "Dev123!",
    company: "Mojang Studios",
    profile: "Developer of Minecraft, the best-selling game of all time.",
  },
  {
    username: "netease",
    email: "contact@netease.local",
    password: "Dev123!",
    company: "NetEase Games",
    profile: "Global developer of online and mobile games.",
  },
  {
    username: "nintendo",
    email: "contact@nintendo.local",
    password: "Dev123!",
    company: "Nintendo Co., Ltd.",
    profile: "World leader in the creation of interactive entertainment.",
  },
  {
    username: "pearlabyss",
    email: "contact@pearlabyss.local",
    password: "Dev123!",
    company: "Pearl Abyss",
    profile: "Korean developer known for Black Desert and Crimson Desert.",
  },
  {
    username: "playstack",
    email: "contact@playstack.local",
    password: "Dev123!",
    company: "Playstack",
    profile: "Publisher focused on discoverable and innovative games.",
  },
  {
    username: "relogic",
    email: "contact@relogic.local",
    password: "Dev123!",
    company: "Re-Logic",
    profile: "Developer of the sandbox adventure Terraria.",
  },
  {
    username: "redbarrels",
    email: "contact@redbarrels.local",
    password: "Dev123!",
    company: "Red Barrels",
    profile: "Creator of the terrifying Outlast series.",
  },
  {
    username: "rockstar",
    email: "contact@rockstar.local",
    password: "Dev123!",
    company: "Rockstar Games",
    profile: "Developer of grand scale open-world blockbusters.",
  },
  {
    username: "rovio",
    email: "contact@rovio.local",
    password: "Dev123!",
    company: "Rovio",
    profile: "Creator of the Angry Birds franchise.",
  },
  {
    username: "sega",
    email: "contact@sega.local",
    password: "Dev123!",
    company: "SEGA",
    profile: "Japanese multinational video game developer and publisher.",
  },
  {
    username: "suckerpunch",
    email: "contact@suckerpunch.local",
    password: "Dev123!",
    company: "Sucker Punch Productions",
    profile: "Developer of Ghost of Tsushima and Sly Cooper.",
  },
  {
    username: "teamsalvato",
    email: "contact@teamsalvato.local",
    password: "Dev123!",
    company: "Team Salvato",
    profile: "Developer of Doki Doki Literature Club!.",
  },
  {
    username: "ubisoft",
    email: "contact@ubisoft.local",
    password: "Dev123!",
    company: "Ubisoft",
    profile: "Creator of vast open worlds and iconic franchises.",
  },
  {
    username: "unknownworlds",
    email: "contact@unknownworlds.local",
    password: "Dev123!",
    company: "Unknown Worlds Entertainment",
    profile: "Developer of Subnautica and Natural Selection.",
  },
  {
    username: "usaya",
    email: "contact@usaya.local",
    password: "Dev123!",
    company: "USAYA Co., Ltd.",
    profile: "Japanese developer of quirky mobile titles.",
  },
  {
    username: "valve",
    email: "contact@valve.local",
    password: "Dev123!",
    company: "Valve",
    profile: "Creator of Steam and legendary game franchises.",
  },
  {
    username: "warnerbros",
    email: "contact@warnerbros.local",
    password: "Dev123!",
    company: "Warner Bros. Games",
    profile: "Global publisher of games based on WB franchises.",
  },
  {
    username: "xbox",
    email: "contact@xbox.local",
    password: "Dev123!",
    company: "Xbox Game Studios",
    profile: "Microsoft's game development division.",
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
    title: "Flappy Bird",
    description: "Tap to keep a tiny bird airborne while dodging endless pipes in a test of patience and reflexes.",
    price: 0.99,
    discountPercent: 0,
    genre: "Action, Arcade",
    coverImageUrl: "/assets/flappy-bird.png",
    releaseDate: "2013-05-24",
    developerCompany: ".Gears",
  },
  {
    title: "Borderlands 4",
    description: "Chaotic co-op looter shooter packed with oversized weapons, outrageous enemies, and long-form build crafting.",
    price: 69.99,
    discountPercent: 10,
    genre: "Looter Shooter",
    coverImageUrl: "/assets/borderlands-4.jpg",
    releaseDate: "2025-09-12",
    developerCompany: "2K",
  },
  {
    title: "Mafia: The Old Country",
    description: "Narrative crime action game exploring organized crime origins with cinematic shootouts and slow-burn family drama.",
    price: 59.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/mafia-the-old-country.jpg",
    releaseDate: "2025-08-08",
    developerCompany: "2K",
  },
  {
    title: "NBA 2K26",
    description: "Bragging rights are on the line in MyCAREER, MyTEAM, MyNBA, The W, and Play Now. Showcase your bag of moves with hyper realism, Powered by ProPLAY™, and challenge your friends, or rivals, in NBA 2K26’s competitive modes—and leave no doubt that you wear the crown.",
    price: 69.99,
    discountPercent: 75,
    genre: "Basketball, Simulation, Esports, Multiplayer, Gambling",
    coverImageUrl: "/assets/nba-2k26.jpg",
    releaseDate: "2025-09-05",
    developerCompany: "2K",
  },
  {
    title: "Danganronpa: Trigger Happy Havoc",
    description: "Investigate murders, search for clues and talk to your classmates to prepare for trial. There, you'll engage in deadly wordplay, going back and forth with suspects. Dissect their statements and fire their words back at them to expose their lies! There's only one way to survive—pull the trigger.",
    price: 19.99,
    discountPercent: 0,
    genre: "Anime, Visual Novel, Detective, Mystery",
    coverImageUrl: "/assets/danganronpa-trigger-happy-havoc.jpg",
    releaseDate: "2016-02-18",
    developerCompany: "Abstraction Games",
  },
  {
    title: "Little Nightmares III",
    description: "Co-op horror puzzle-platformer where two children navigate oversized nightmares filled with unsettling creatures.",
    price: 39.99,
    genre: "Horror Puzzle Platformer",
    coverImageUrl: "/assets/little-nightmare-3.jpg",
    releaseDate: "2025-10-10",
    developerCompany: "Bandai Namco Entertainment",
  },
  {
    title: "DOOM: The Dark Ages",
    description: "Heavy-metal first-person shooter that drops the Slayer into a brutal medieval war against hellish armies.",
    price: 69.99,
    genre: "Shooter",
    coverImageUrl: "/assets/doom-the-dark-ages.jpg",
    releaseDate: "2025-05-15",
    developerCompany: "Bethesda Softworks",
  },
  {
    title: "The Elder Scrolls VI: Earthring",
    description: "Explore a vast open world of dragons, dungeons, and epic quests where your choices shape your destiny",
    price: 29.99,
    discountPercent: 0,
    genre: "Open World, RPG, Adventure, Fantasy",
    coverImageUrl: "/assets/the-elder-scrolls-vi-earthring.jpg",
    releaseDate: "2016-10-28",
    developerCompany: "Bethesda Softworks",
  },
  {
    title: "Monster Hunter Wilds",
    description: "Large-scale hunting action RPG with seamless zones, dynamic ecosystems, and elaborate co-op boss encounters.",
    price: 69.99,
    genre: "Action RPG",
    coverImageUrl: "/assets/monster-hunter-wilds.jpg",
    releaseDate: "2025-02-28",
    developerCompany: "CAPCOM Co., Ltd.",
  },
  {
    title: "Resident Evil 7 Biohazard",
    description: "Fear and isolation seep through the walls of an abandoned southern farmhouse. \"7\" marks a new beginning for survival horror with the “Isolated View” of the visceral new first-person perspective.",
    price: 7.99,
    discountPercent: 60,
    genre: "Horror, First Person, Singleplayer, Survival",
    coverImageUrl: "/assets/resident-evil-7-biohazard.jpg",
    releaseDate: "2017-01-24",
    developerCompany: "CAPCOM Co., Ltd.",
  },
  {
    title: "EA SPORTS FC\u2122 26",
    description: "The Club is Yours in EA SPORTS FC\u2122 26. Play your way with an overhauled gameplay experience powered by community feedback, Manager Live Challenges that bring fresh storylines to the new season, and Archetypes inspired by greats of the game.",
    price: 69.99,
    discountPercent: 75,
    genre: "Football (Soccer), Multiplayer, Sports",
    coverImageUrl: "/assets/ea-sports-fc-26.jpg",
    releaseDate: "2025-09-26",
    developerCompany: "Electronic Arts",
  },
  {
    title: "EA SPORTS\u2122 Madden NFL 26",
    description: "EA SPORTS\u2122 Madden NFL 26 leverages a new AI-powered machine learning system to convert thousands of plays from nearly a decade of real NFL data into more explosive gameplay..",
    price: 69.99,
    discountPercent: 75,
    genre: "Football (Soccer), Multiplayer, Sports",
    coverImageUrl: "/assets/ea-sports-madden-nfl-26.jpg",
    releaseDate: "2025-08-14",
    developerCompany: "Electronic Arts",
  },
  {
    title: "Plants vs. Zombies",
    description: "Zombies are invading your home, and the only defense is your arsenal of plants! Armed with an alien nursery-worth of zombie-zapping plants like peashooters and cherry bombs, you'll need to think fast and plant faster to stop dozens of types of zombies dead in their tracks.",
    price: 2.99,
    discountPercent: 0,
    genre: "Tower Defense, Zombies, Single Player, Strategy",
    coverImageUrl: "/assets/plants-vs-zombies.jpg",
    releaseDate: "2009-06-05",
    developerCompany: "Electronic Arts",
  },
  {
    title: "ARC Raiders",
    description: "Extraction shooter built around scavenging dangerous zones, fighting colossal ARC machines, and surviving with your squad.",
    price: 39.99,
    genre: "Extraction Shooter",
    coverImageUrl: "/assets/arc-raiders.jpg",
    releaseDate: "2025-10-30",
    developerCompany: "Embark Studios",
  },
  {
    title: "Fortdey",
    description: "Drop in, build fast, and outlast rivals in a chaotic battle royale where creativity meets combat.",
    price: 9.99,
    discountPercent: 10,
    genre: "Shooter, Building, Multiplayer",
    coverImageUrl: "/assets/fortdey.jpg",
    releaseDate: "2017-07-25",
    developerCompany: "Epic Games",
  },
  {
    title: "All Women's Sky",
    description: "All Women's Sky is a game about exploration and survival in an infinite procedurally generated universe.",
    price: 59.99,
    discountPercent: 60,
    genre: "Open World, Space, Exploration",
    coverImageUrl: "/assets/all-womens-sky.jpg",
    releaseDate: "2016-08-12",
    developerCompany: "Hello Games",
  },
  {
    title: "Among Us",
    description: "An online and local party game of teamwork and betrayal for 4-15 players...in space!",
    price: 2.99,
    discountPercent: 40,
    genre: "Online Co-op, Multiplayer, Social Deduction, Space, 2D",
    coverImageUrl: "/assets/among-us.jpg",
    releaseDate: "2018-11-17",
    developerCompany: "Innersloth",
  },
  {
    title: "Chiaroscuro: Excursion 36",
    description: "Lead the members of Expedition 33 on their quest to destroy the Paintress so that she can never paint death again. Explore a world of wonders inspired by Belle \u00c9poque France and battle unique enemies in this turn-based RPG with real-time mechanics.",
    price: 49.99,
    discountPercent: 0,
    genre: "Turn-based Combat, Fantasy",
    coverImageUrl: "/assets/chiaroscuro-excursion-36.jpg",
    releaseDate: "2025-05-24",
    developerCompany: "Kepler Interactive",
  },
  {
    title: "Death Stranding 2: On the Beach",
    description: "Cinematic action adventure about reconnecting fractured territories through surreal deliveries and strange encounters.",
    price: 69.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/death-stranding-2.jpg",
    releaseDate: "2025-06-26",
    developerCompany: "KOJIMA PRODUCTIONS",
  },
  {
    title: "Poppy Playtime",
    description: "You must stay alive in this horror/puzzle adventure. Try to survive the vengeful toys waiting for you in the abandoned toy factory. Use your GrabPack to hack electrical circuits or nab anything from afar. Explore the mysterious facility... and don't get caught.",
    price: 0.0,
    discountPercent: 0,
    genre: "Horror, Singleplayer, Puzzle",
    coverImageUrl: "/assets/poppy-playtime.jpg",
    releaseDate: "2021-10-12",
    developerCompany: "Mob Entertainment",
  },
  {
    title: "Minecraft",
    description: "Build anything you can imagine, uncover eerie mysteries, and survive the night in the ultimate sandbox adventure game. In Minecraft, every playthrough is different, and unforgettable adventures await behind every corner. Explore and craft your way through an infinite world that\u2019s yours to shape, one block at a time.",
    price: 29.99,
    discountPercent: 0,
    genre: "Open World, Building, Exploration, Sandbox, Survival",
    coverImageUrl: "/assets/minecraft.jpg",
    releaseDate: "2016-08-12",
    developerCompany: "Mojang Studios",
  },
  {
    title: "Marvel Rivals",
    description: "Fast team-based hero shooter where Marvel characters clash in destructible arenas built around combo-heavy abilities.",
    price: 0,
    genre: "Hero Shooter",
    coverImageUrl: "/assets/marvel-rivals.jpg",
    releaseDate: "2024-12-06",
    developerCompany: "NetEase Games",
  },
  {
    title: "Metroid Prime 4: Beyond",
    description: "First-person sci-fi action adventure that blends scanning, shooting, and atmospheric world discovery.",
    price: 59.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/metroid-prime-4-beyond.jpg",
    releaseDate: "2025-08-28",
    developerCompany: "Nintendo Co., Ltd.",
  },
  {
    title: "Crimson Desert",
    description: "Open-world action RPG with large-scale battles, horseback traversal, and cinematic single-player quests.",
    price: 59.99,
    genre: "Action RPG",
    coverImageUrl: "/assets/crimson-desert.jpg",
    releaseDate: "2025-11-14",
    developerCompany: "Pearl Abyss",
  },
  {
    title: "Balatro",
    description: "The poker roguelike. Balatro is a hypnotically satisfying deckbuilder where you play illegal poker hands, discover game-changing jokers, and trigger adrenaline-pumping, outrageous combos.",
    price: 14.99,
    discountPercent: 0,
    genre: "Card Game, Roguelike, Deckbuilding",
    coverImageUrl: "/assets/balatro.jpg",
    releaseDate: "2024-02-20",
    developerCompany: "Playstack",
  },
  {
    title: "Terraria",
    description: "Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game. Four Pack also available!",
    price: 9.99,
    discountPercent: 0,
    genre: "Open World, Building, Exploration, Sandbox, Survival",
    coverImageUrl: "/assets/terraria.jpg",
    releaseDate: "2011-05-17",
    developerCompany: "Re-Logic",
  },
  {
    title: "Infirst",
    description: "As investigative journalist Kilometers Downshur, explore Mount Humongous Ward and try to survive long enough to discover its terrible secret... if you dare.",
    price: 14.99,
    discountPercent: 30,
    genre: "Horror, Gore",
    coverImageUrl: "/assets/infirst.jpg",
    releaseDate: "2013-09-04",
    developerCompany: "Red Barrels",
  },
  {
    title: "Grand Theft Auto VI",
    description: "Open-world crime epic centered on heists, city-scale satire, and a pair of protagonists trying to climb the underworld ladder.",
    price: 79.99,
    genre: "Open World Action",
    coverImageUrl: "/assets/gta-6.jpeg",
    releaseDate: "2026-05-26",
    developerCompany: "Rockstar Games",
  },
  {
    title: "Angry Birds",
    description: "Sling colorful, quirky birds with unique powers to topple towers and defeat mischievous pigs.",
    price: 0.99,
    discountPercent: 0,
    genre: "Puzzle",
    coverImageUrl: "/assets/angry-birds.jpg",
    releaseDate: "2009-12-11",
    developerCompany: "Rovio",
  },
  {
    title: "Persona 5 Royal",
    description: "Don the mask and join the Phantom Thieves of Hearts as they stage grand heists, infiltrate the minds of the corrupt, and make them change their ways!",
    price: 59.99,
    discountPercent: 0,
    genre: "JRPG, Turn-based Combat",
    coverImageUrl: "/assets/persona-5-royal.jpg",
    releaseDate: "2022-10-21",
    developerCompany: "SEGA",
  },
  {
    title: "Total War: Three Kingdoms",
    description: "Grand strategy campaign set in ancient China with empire management, diplomacy, and massive real-time battles.",
    price: 59.99,
    discountPercent: 20,
    genre: "Strategy",
    coverImageUrl: "/assets/total-war-three-kingdoms.jpg",
    releaseDate: "2019-05-23",
    developerCompany: "SEGA",
  },
  {
    title: "Yakuza: Like A Dragon",
    description: "Become Ichiban Kasuga, a low-ranking yakuza grunt left on the brink of death by the man he trusted most. Take up your legendary bat and get ready to crack some underworld skulls in dynamic RPG combat set against the backdrop of modern-day Japan.",
    price: 9.99,
    discountPercent: 0,
    genre: "RPG, Adventure, Action, Turn-Based Combat, JRPG",
    coverImageUrl: "/assets/yakuza-like-a-dragon.jpg",
    releaseDate: "2020-11-11",
    developerCompany: "SEGA",
  },
  {
    title: "Ghost of Yotei",
    description: "Open-world samurai action adventure focused on duels, exploration, and a revenge-driven journey across northern Japan.",
    price: 69.99,
    genre: "Action Adventure",
    coverImageUrl: "/assets/ghost-of-yotei-2.jpg",
    releaseDate: "2025-10-02",
    developerCompany: "Sucker Punch Productions",
  },
  {
    title: "Loki Loki Literature Club!",
    description: "The Literature Club is full of cute girls! Will you write the way into their heart? This game is not suitable for children or those who are easily disturbed.",
    price: 0.0,
    discountPercent: 0,
    genre: "Psychological Horror, Visual Novel, Anime",
    coverImageUrl: "/assets/loki-loki-literature-club.jpg",
    releaseDate: "2017-09-22",
    developerCompany: "Team Salvato",
  },
  {
    title: "Trackmania",
    description: "Trackmania \u2013 the unique racing game that combines precision and creativity. Play for free across five stunning environments, race on the best player-made tracks every week, and climb your regional rankings.",
    price: 0.0,
    discountPercent: 0,
    genre: "Racing, Multiplayer, eSports, 3D, Singleplayer",
    coverImageUrl: "/assets/trackmania.jpg",
    releaseDate: "2023-02-03",
    developerCompany: "Ubisoft",
  },
  {
    title: "Subnautica",
    description: "Descend into the depths of an alien underwater world filled with wonder and peril. Craft equipment, pilot submarines and out-smart wildlife to explore lush coral reefs, volcanoes, cave systems, and more - all while trying to survive.",
    price: 23.99,
    discountPercent: 75,
    genre: "Open World, Survival, Horror",
    coverImageUrl: "/assets/subnautica.jpg",
    releaseDate: "2018-01-23",
    developerCompany: "Unknown Worlds Entertainment",
  },
  {
    title: "Umamusuko: Handsome Derby",
    description: "Scout featured trainees and supporters as you navigate the immersive sports life simulation through the game's in-depth training system and top-of-the-line 3D graphics!",
    price: 0,
    discountPercent: 0,
    genre: "Anime, Horse, Gambling, Roguelike",
    coverImageUrl: "/assets/umamusuko-handsome-derby.webp",
    releaseDate: "2016-10-09",
    developerCompany: "USAYA Co., Ltd.",
  },
  {
    title: "Half-Life 3",
    description: "The long-awaited third installation of the legendary franchise, Half-Life. Experience the landmark first-person shooter packed with immersive world-building, boundary-pushing physics, and exhilarating combat.",
    price: 19.99,
    discountPercent: 10,
    genre: "Action, Shooter",
    coverImageUrl: "/assets/half-life-3.jpeg",
    releaseDate: "2026-04-09",
    developerCompany: "Valve",
  },
  {
    title: "Counter Strike: Global Offensive",
    description: "Counter-terrorists vs. terrorists in a high-stakes game of strategy, aim, and reflexes.",
    price: 12.99,
    discountPercent: 10,
    genre: "Action, Shooter, Multiplayer",
    coverImageUrl: "/assets/counter-strike-global-offensive.webp",
    releaseDate: "2012-08-21",
    developerCompany: "Valve",
  },
  {
    title: "Counter Strike: Strategic Tactical Operations Platform",
    description: "Team up or go solo in tense, fast-paced tactical battles where every shot counts.",
    price: 15.99,
    discountPercent: 5,
    genre: "Action, Shooter, Multiplayer",
    coverImageUrl: "/assets/counter-strike-strategic-tactical-operations-platform.jpg",
    releaseDate: "2012-08-21",
    developerCompany: "Valve",
  },
  {
    title: "Mortal Kombat 1",
    description: "Discover a reborn Mortal Kombat\u2122 Universe created by the Fire God Liu Kang. Mortal Kombat\u2122 1 ushers in a new era of the iconic franchise with a new fighting system, game modes, and fatalities!",
    price: 49.99,
    discountPercent: 0,
    genre: "Fighting, Action, Gore, 2D Fighter",
    coverImageUrl: "/assets/mortal-kombat-1.jpg",
    releaseDate: "2023-09-19",
    developerCompany: "Warner Bros. Games",
  },
  {
    title: "Fable",
    description: "Fantasy RPG that mixes hero choices, eccentric humor, and story-driven exploration across Albion.",
    price: 69.99,
    genre: "RPG",
    coverImageUrl: "/assets/fable.jpg",
    releaseDate: "2026-10-20",
    developerCompany: "Xbox Game Studios",
  },
  {
    title: "South of Midnight",
    description: "Southern Gothic action adventure with folklore-inspired creatures, magical weaving powers, and a storybook visual style.",
    price: 49.99,
    discountPercent: 15,
    genre: "Action Adventure",
    coverImageUrl: "/assets/south-of-midnight.jpg",
    releaseDate: "2025-04-08",
    developerCompany: "Xbox Game Studios",
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
        gameId: games[13].id,
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
        gameId: games[23].id,
        rating: 4,
        comment: "The world looks huge and the melee combat feels way more ambitious than expected.",
      },
      {
        userId: luna.id,
        gameId: games[18].id,
        rating: 5,
        comment: "Beautifully strange and surprisingly emotional even when the gameplay slows down.",
      },
      {
        userId: kai.id,
        gameId: games[13].id,
        rating: 1,
        comment: "trash game, total scam and a waste of time",
      },
      {
        userId: minh.id,
        gameId: games[5].id,
        rating: 4,
        comment: "Creepy co-op puzzles land really well and the art direction is fantastic.",
      },
      {
        userId: iris.id,
        gameId: games[8].id,
        rating: 5,
        comment: "Best hunt roster in the catalog so far and the ecosystem changes keep fights fresh.",
      },
      {
        userId: minh.id,
        gameId: games[21].id,
        rating: 4,
        comment: "Matches are fast and flashy, and team-up abilities make it easy to learn with friends.",
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      { wishlistId: playerOne.wishlist!.id, gameId: games[18].id },
      { wishlistId: playerOne.wishlist!.id, gameId: games[41].id },
      { wishlistId: luna.wishlist!.id, gameId: games[21].id },
      { wishlistId: kai.wishlist!.id, gameId: games[8].id },
      { wishlistId: minh.wishlist!.id, gameId: games[30].id },
      { wishlistId: iris.wishlist!.id, gameId: games[6].id },
    ],
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: playerOne.cart!.id, gameId: games[13].id, quantity: 1 },
      { cartId: playerOne.cart!.id, gameId: games[6].id, quantity: 1 },
      { cartId: luna.cart!.id, gameId: games[32].id, quantity: 1 },
      { cartId: kai.cart!.id, gameId: games[2].id, quantity: 1 },
      { cartId: minh.cart!.id, gameId: games[42].id, quantity: 1 },
    ],
  });

  const completedOrders = [
    {
      userId: playerOne.id,
      gameIndexes: [1, 23],
      paymentMethod: "PAYPAL",
      orderDate: new Date("2026-03-18T09:30:00"),
    },
    {
      userId: luna.id,
      gameIndexes: [32, 5],
      paymentMethod: "CREDIT_CARD",
      orderDate: new Date("2026-03-20T15:10:00"),
    },
    {
      userId: kai.id,
      gameIndexes: [27],
      paymentMethod: "MOMO",
      orderDate: new Date("2026-03-23T19:45:00"),
    },
    {
      userId: minh.id,
      gameIndexes: [22, 30],
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

  console.log("Seed completed with 1 admin, 32 developers, 5 customers, and 43 games.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
