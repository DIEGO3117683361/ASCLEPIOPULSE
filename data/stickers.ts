const backgroundColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'f5f5f5'];
const getColor = () => backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

export const STICKERS = [
  `https://api.dicebear.com/8.x/micah/svg?seed=Buster&backgroundColor=${getColor()}&mouth=laughing`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Leo&backgroundColor=${getColor()}&mouth=happy`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Whiskers&backgroundColor=${getColor()}&mouth=surprised`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Jasmine&backgroundColor=${getColor()}&mouth=pucker`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Zoe&backgroundColor=${getColor()}&mouth=smile`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Admin&backgroundColor=${getColor()}&accessories=shades`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Sam&backgroundColor=${getColor()}&mouth=nervous`,
  `https://api.dicebear.com/8.x/micah/svg?seed=Felix&backgroundColor=${getColor()}&mouth=cute`,
];
