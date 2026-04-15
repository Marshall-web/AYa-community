// Drinks menu data with pricing - Updated with actual client data
import { menuImages } from "./menuImages";

export interface Drink {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  description: string;
  size?: string;
  isAlcoholic?: boolean;
}

export const drinksMenu: Drink[] = [
  // Soft Drinks
  {
    id: 1,
    name: "Coke",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/coke.jpg",
    available: true,
    description: "Classic Coca-Cola",
    isAlcoholic: false
  },
  {
    id: 2,
    name: "Fanta",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/fanta.jpg",
    available: true,
    description: "Refreshing orange soda",
    isAlcoholic: false
  },
  {
    id: 3,
    name: "Sprite",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/sprite.jpg",
    available: true,
    description: "Lemon-lime soda",
    isAlcoholic: false
  },
  {
    id: 4,
    name: "Coke Zero",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/coke-zero.jpg",
    available: true,
    description: "Sugar-free Coca-Cola",
    isAlcoholic: false
  },
  {
    id: 5,
    name: "Fanta Pineapple",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/fanta-pineapple.jpg",
    available: true,
    description: "Tropical pineapple soda",
    isAlcoholic: false
  },
  {
    id: 6,
    name: "Stoney",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/stoney.jpg",
    available: true,
    description: "Ginger beer",
    isAlcoholic: false
  },
  {
    id: 7,
    name: "Club Soda",
    price: 12,
    category: "Soft Drinks",
    image: "/drinks/club-soda.jpg",
    available: true,
    description: "Carbonated water",
    isAlcoholic: false
  },
  {
    id: 8,
    name: "Tonic Water",
    price: 15,
    category: "Soft Drinks",
    image: "/drinks/tonic.jpg",
    available: true,
    description: "Schweppes tonic water",
    isAlcoholic: false
  },

  // Juices
  {
    id: 9,
    name: "Orange Juice",
    price: 25,
    category: "Juices",
    image: "/drinks/orange-juice.jpg",
    available: true,
    description: "Fresh orange juice",
    isAlcoholic: false
  },
  {
    id: 10,
    name: "Pineapple Juice",
    price: 25,
    category: "Juices",
    image: "/drinks/pineapple-juice.jpg",
    available: true,
    description: "Fresh pineapple juice",
    isAlcoholic: false
  },
  {
    id: 11,
    name: "Apple Juice",
    price: 25,
    category: "Juices",
    image: "/drinks/apple-juice.jpg",
    available: true,
    description: "Fresh apple juice",
    isAlcoholic: false
  },
  {
    id: 12,
    name: "Mango Juice",
    price: 30,
    category: "Juices",
    image: "/drinks/mango-juice.jpg",
    available: true,
    description: "Fresh mango juice",
    isAlcoholic: false
  },

  // Water
  {
    id: 13,
    name: "Bottled Water",
    price: 10,
    category: "Water",
    image: "/drinks/water.jpg",
    available: true,
    description: "Mineral water",
    isAlcoholic: false
  },

  // Energy Drinks
  {
    id: 14,
    name: "Red Bull",
    price: 20,
    category: "Energy Drinks",
    image: "/drinks/red-bull.jpg",
    available: true,
    description: "Energy drink",
    isAlcoholic: false
  },

  // Beers
  {
    id: 15,
    name: "Guinness",
    price: 25,
    category: "Beer",
    image: menuImages["Guinness"],
    available: true,
    description: "Guinness Stout",
    isAlcoholic: true
  },
  {
    id: 16,
    name: "Star",
    price: 20,
    category: "Beer",
    image: menuImages["star"],
    available: true,
    description: "Star Beer",
    isAlcoholic: true
  },
  {
    id: 17,
    name: "Club",
    price: 20,
    category: "Beer",
    image: "/drinks/club.jpg",
    available: true,
    description: "Club Beer",
    isAlcoholic: true
  },
  {
    id: 18,
    name: "Heineken",
    price: 25,
    category: "Beer",
    image: menuImages["Heineken"],
    available: true,
    description: "Heineken Lager",
    isAlcoholic: true
  },

  // Wines
  {
    id: 19,
    name: "Red Wine",
    price: 80,
    category: "Wine",
    image: "/drinks/red-wine.jpg",
    available: true,
    description: "House red wine",
    isAlcoholic: true
  },
  {
    id: 20,
    name: "White Wine",
    price: 80,
    category: "Wine",
    image: "/drinks/white-wine.jpg",
    available: true,
    description: "House white wine",
    isAlcoholic: true
  },

  // Spirits
  {
    id: 21,
    name: "Johnnie Walker Red",
    price: 120,
    category: "Spirits",
    image: menuImages["red-label"],
    available: true,
    description: "Johnnie Walker Red Label",
    isAlcoholic: true
  },
  {
    id: 22,
    name: "Hennessy VS",
    price: 150,
    category: "Spirits",
    image: "/drinks/hennessy.jpg",
    available: true,
    description: "Hennessy VS",
    isAlcoholic: true
  },
  {
    id: 23,
    name: "Baileys",
    price: 100,
    category: "Spirits",
    image: "/drinks/baileys.jpg",
    available: true,
    description: "Baileys Irish Cream",
    isAlcoholic: true
  },
  {
    id: 24,
    name: "Alvaro",
    price: 15,
    category: "Soft Drinks",
    image: menuImages["Alvaro"],
    available: true,
    description: "Refreshing malt-based soft drink",
    isAlcoholic: false
  },
  {
    id: 25,
    name: "Beta Malt",
    price: 10,
    category: "Soft Drinks",
    image: menuImages["Beta-malt"],
    available: true,
    description: "Premium malt drink",
    isAlcoholic: false
  },
  {
    id: 26,
    name: "Can Malt",
    price: 20,
    category: "Soft Drinks",
    image: menuImages["Can-malt"],
    available: true,
    description: "Malt drink in a can",
    isAlcoholic: false
  },
  {
    id: 27,
    name: "B.Malt",
    price: 15,
    category: "Soft Drinks",
    image: menuImages["B-Malt"],
    available: true,
    description: "Classic malt drink",
    isAlcoholic: false
  },
  {
    id: 28,
    name: "Gulder",
    price: 20,
    category: "Beer",
    image: menuImages["Gulder"],
    available: true,
    description: "Gulder Lager Beer",
    isAlcoholic: true
  },
  {
    id: 29,
    name: "Eagle",
    price: 15,
    category: "Beer",
    image: menuImages["Eagle"],
    available: true,
    description: "Eagle Lager",
    isAlcoholic: true
  },
  {
    id: 30,
    name: "Shandy",
    price: 20,
    category: "Beer",
    image: menuImages["Shandy"],
    available: true,
    description: "Refreshing Shandy",
    isAlcoholic: true
  },
  {
    id: 31,
    name: "Bullet",
    price: 25,
    category: "Energy Drinks",
    image: menuImages["bullet"],
    available: true,
    description: "Energy drink",
    isAlcoholic: false
  },
  {
    id: 32,
    name: "Vita Milk",
    price: 20,
    category: "Soft Drinks",
    image: menuImages["vita-milk"],
    available: true,
    description: "Nutritious soy milk",
    isAlcoholic: false
  },
  {
    id: 33,
    name: "Tampico",
    price: 15,
    category: "Juices",
    image: menuImages["Tampico"],
    available: true,
    description: "Fruit juice blend",
    isAlcoholic: false
  },
  {
    id: 34,
    name: "Hollandia Yogurt",
    price: 70,
    category: "Soft Drinks",
    image: menuImages["hollandia-yogurt"],
    available: true,
    description: "Smooth and creamy yogurt drink",
    isAlcoholic: false
  }
];

// Helper functions
export const getDrinksByCategory = (category: string): Drink[] => {
  return drinksMenu.filter(drink => drink.category === category);
};

export const getAvailableDrinks = (): Drink[] => {
  return drinksMenu.filter(drink => drink.available);
};

export const getAlcoholicDrinks = (): Drink[] => {
  return drinksMenu.filter(drink => drink.isAlcoholic);
};

export const getNonAlcoholicDrinks = (): Drink[] => {
  return drinksMenu.filter(drink => !drink.isAlcoholic);
};

export const getDrinkById = (id: number): Drink | undefined => {
  return drinksMenu.find(drink => drink.id === id);
};

export const getCategories = (): string[] => {
  return [...new Set(drinksMenu.map(drink => drink.category))];
};
