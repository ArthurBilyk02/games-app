import {Game, GameDeveloper} from '../shared/types'

export const games : Game[] = [
{
    id: 1,
    name: "Battlefield V",
    genre_ids: [1, 3, 5], // Assuming genre_ids 1 = Action, 3 = Shooter, 5 = War
    platform: "PC",
    release_date: "2018-11-20",
    description: "Experience the chaos of all-out war as Battlefield goes back to its roots with an unparalleled World War II experience.",
    popularity: 85.5,
    cover_image_path: "/images/battlefield_v.jpg",
    rating: 8.4,
    rating_count: 1520,
    developer: "DICE",
    publisher: "Electronic Arts",
    is_multiplayer: true,
    userId: "defaultUserId"
  },
  {
    id: 2,
    name: "The Witcher 3: Wild Hunt",
    genre_ids: [4, 6], // Assuming genre_ids 4 = RPG, 6 = Fantasy
    platform: "PC, PS4, Xbox One",
    release_date: "2015-05-19",
    description: "A story-driven, open world adventure set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.",
    popularity: 90.7,
    cover_image_path: "/images/witcher_3.jpg",
    rating: 9.3,
    rating_count: 3400,
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    is_multiplayer: false,
    userId: "defaultUserId"
  },
  {
    id: 3,
    name: "Animal Crossing: New Horizons",
    genre_ids: [7, 8], // Assuming genre_ids 7 = Simulation, 8 = Life Simulation
    platform: "Nintendo Switch",
    release_date: "2020-03-20",
    description: "Escape to a deserted island and create your own paradise as you explore, create, and customize your island life.",
    popularity: 92.3,
    cover_image_path: "/images/animal_crossing.jpg",
    rating: 8.9,
    rating_count: 2750,
    developer: "Nintendo",
    publisher: "Nintendo",
    is_multiplayer: true,
    userId: "defaultUserId"
  },
  {
    id: 4,
    name: "Cyberpunk 2077",
    genre_ids: [4, 9, 10], // Assuming genre_ids 9 = Sci-Fi, 10 = Open World
    platform: "PC, PS4, PS5, Xbox One, Xbox Series X/S",
    release_date: "2020-12-10",
    description: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour, and body modification.",
    popularity: 88.1,
    cover_image_path: "/images/cyberpunk_2077.jpg",
    rating: 7.8,
    rating_count: 2500,
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    is_multiplayer: false,
    userId: "defaultUserId"
  },
  {
    id: 5,
    name: "Overwatch",
    genre_ids: [3, 11], // Assuming genre_ids 11 = Team-Based Shooter
    platform: "PC, PS4, Xbox One, Nintendo Switch",
    release_date: "2016-05-24",
    description: "Team up and accomplish objectives in this colorful, character-based, multiplayer shooter.",
    popularity: 84.6,
    cover_image_path: "/images/overwatch.jpg",
    rating: 8.5,
    rating_count: 1980,
    developer: "Blizzard Entertainment",
    publisher: "Blizzard Entertainment",
    is_multiplayer: true,
    userId: "defaultUserId"
  },
{
    id: 6,
    name: "Red Dead Redemption 2",
    genre_ids: [1, 4, 10], // Assuming genre_ids 1 = Action, 10 = Open World
    platform: "PC, PS4, Xbox One",
    release_date: "2018-10-26",
    description: "America, 1899. The end of the Wild West era has begun as lawmen hunt down the last remaining outlaw gangs.",
    popularity: 91.2,
    cover_image_path: "/images/red_dead_redemption_2.jpg",
    rating: 9.8,
    rating_count: 4100,
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    is_multiplayer: true,
    userId: "defaultUserId"
},
{
    id: 7,
    name: "The Legend of Zelda: Breath of the Wild",
    genre_ids: [4, 6], // Assuming genre_ids 4 = RPG, 6 = Fantasy
    platform: "Nintendo Switch",
    release_date: "2017-03-03",
    description: "Step into a world of discovery, exploration, and adventure in The Legend of Zelda: Breath of the Wild.",
    popularity: 93.5,
    cover_image_path: "/images/zelda_breath_of_the_wild.jpg",
    rating: 9.7,
    rating_count: 3200,
    developer: "Nintendo",
    publisher: "Nintendo",
    is_multiplayer: false,
    userId: "defaultUserId"
},
{
    id: 8,
    name: "Super Mario Odyssey",
    genre_ids: [7, 8], // Assuming genre_ids 7 = Simulation, 8 = Life Simulation
    platform: "Nintendo Switch",
    release_date: "2017-10-27",
    description: "Join Mario on a massive, globe-trotting 3D adventure and use his incredible new abilities to collect Moons so you can power up your airship, the Odyssey, and rescue Princess Peach from Bowser's wedding plans!",
    popularity: 94.1,
    cover_image_path: "/images/super_mario_odyssey.jpg",
    rating: 9.5,
    rating_count: 2900,
    developer: "Nintendo",
    publisher: "Nintendo",
    is_multiplayer: false,
    userId: "defaultUserId"
},
{
    id: 9,
    name: "Fortnite",
    genre_ids: [3, 11], // Assuming genre_ids 11 = Team-Based Shooter
    platform: "PC, PS4, PS5, Xbox One, Xbox Series X/S, Nintendo Switch",
    release_date: "2017-07-25",
    description: "Drop into a colorful, action-packed battle royale game that pits 100 players against each other in a fight for survival.",
    popularity: 86.8,
    cover_image_path: "/images/fortnite.jpg",
    rating: 8.2,
    rating_count: 1500,
    developer: "Epic Games",
    publisher: "Epic Games",
    is_multiplayer: true,
    userId: "defaultUserId"
},
{
    id: 10,
    name: "Minecraft",
    genre_ids: [7, 8], // Assuming genre_ids 7 = Simulation, 8 = Life Simulation
    platform: "PC, PS4, PS5, Xbox One, Xbox Series X/S, Nintendo Switch",
    release_date: "2011-11-18",
    description: "Explore randomly generated worlds and build amazing things from the simplest of homes to the grandest of castles.",
    popularity: 95.2,
    cover_image_path: "/images/minecraft.jpg",
    rating: 9.0,
    rating_count: 3600,
    developer: "Mojang Studios",
    publisher: "Mojang Studios",
    is_multiplayer: true,
    userId: "defaultUserId"
}
]

export const gameDevelopers: GameDeveloper[] = [
{
    gameId: 1,
    developerName: "Joe Bloggs",
    roleName: "Lead Character Designer",
    roleDescription: "In charge of character design",
},
{
    gameId: 1,
    developerName: "Alice Broggs",
    roleName: "Lead Game Designer",
    roleDescription: "In charge of game design",
},
{
    gameId: 2,
    developerName: "Joe Cloggs",
    roleName: "Graphic Designer",
    roleDescription: "In charge of graphics",
},
{
    gameId: 3,
    developerName: "Alice Springs",
    roleName: "Sound Designer",
    roleDescription: "Responsible for in-game sound effects",
},
{
    gameId: 4,
    developerName: "Sam Yates",
    roleName: "Lead Programmer",
    roleDescription: "Manages the game's codebase",
},
{
    gameId: 5,
    developerName: "Oliver Queen",
    roleName: "Art Director",
    roleDescription: "Oversees all visual aspects",
},
{
    gameId: 6,
    developerName: "Robert Miles",
    roleName: "Animator",
    roleDescription: "Handles character animations",
},
{
    gameId: 7,
    developerName: "Chris Lane",
    roleName: "Systems Designer",
    roleDescription: "Designs in-game systems and features",
},
{
    gameId: 8,
    developerName: "Tom Jacobs",
    roleName: "Marketing Specialist",
    roleDescription: "Handles promotional activities and campaigns",
},
{
    gameId: 9,
    developerName: "Daniel Reed",
    roleName: "Cinematics Director",
    roleDescription: "Directs in-game cinematics and story sequences",
},
{
    gameId: 10,
    developerName: "Michael Scott",
    roleName: "Game Designer",
    roleDescription: "Works on game mechanics and player interactions",
}
];