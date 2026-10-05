import type { Category, Ingredient, Recipe } from '../domain/schemas';

// Generic mock recipes. Ingredients overlap on purpose so leftovers appear.

const item = (name: string, quantity: number, unit: string, category: Category): Ingredient => ({
  name,
  quantity,
  unit,
  category,
  perishable: false,
});

const fresh = (
  name: string,
  quantity: number,
  unit: string,
  category: Category,
  shelfLifeDays: number,
  packSize?: number,
): Ingredient => ({ name, quantity, unit, category, perishable: true, shelfLifeDays, ...(packSize ? { packSize } : {}) });

// Shared perishables (same name, unit, shelf life, and pack everywhere).
const beef = (lb: number) => fresh('Ground beef', lb, 'lb', 'meat & fish', 2, 1);
const chicken = (lb: number) => fresh('Chicken breast', lb, 'lb', 'meat & fish', 2, 1.5);
const cilantro = (bunch: number) => fresh('Cilantro', bunch, 'bunch', 'produce', 2, 1);
const spinach = (cup: number) => fresh('Baby spinach', cup, 'cup', 'produce', 3, 5);
const cream = (cup: number) => fresh('Heavy cream', cup, 'cup', 'dairy & eggs', 7, 1);
const sourCream = (cup: number) => fresh('Sour cream', cup, 'cup', 'dairy & eggs', 10, 1);
const tortillas = (n: number) => fresh('Flour tortillas', n, 'each', 'bakery', 7, 10);
const parmesan = (cup: number) => fresh('Parmesan', cup, 'cup', 'dairy & eggs', 21, 1);
const bellPepper = (n: number) => fresh('Bell pepper', n, 'each', 'produce', 7);
const onion = (n: number) => item('Onion', n, 'each', 'produce');
const rice = (cup: number) => item('Rice', cup, 'cup', 'pantry');

export const mockRecipes: Recipe[] = [
  {
    id: 'spaghetti',
    name: 'Spaghetti Bolognese',
    servings: 2,
    ingredients: [beef(1), item('Spaghetti', 1, 'box', 'pantry'), item('Crushed tomatoes', 1, 'can', 'pantry'), onion(1), item('Garlic', 2, 'clove', 'produce'), parmesan(0.25)],
    notes: 'Simmer the sauce at least 20 minutes. Freezes well.',
  },
  {
    id: 'tacos',
    name: 'Beef Tacos',
    servings: 2,
    ingredients: [beef(0.5), tortillas(6), cilantro(0.5), item('Lime', 1, 'each', 'produce'), sourCream(0.5), item('Cheddar', 1, 'cup', 'dairy & eggs')],
    notes: 'Warm the tortillas in a dry pan.',
  },
  {
    id: 'fish-chips',
    name: 'Fish and Chips',
    servings: 2,
    ingredients: [fresh('Cod fillets', 1, 'lb', 'meat & fish', 2, 1), item('Potatoes', 2, 'lb', 'produce'), item('Flour', 1, 'cup', 'pantry'), item('Lemon', 1, 'each', 'produce')],
    notes: 'Oven chips: 220°C for 35 minutes, flip halfway.',
  },
  {
    id: 'stir-fry',
    name: 'Chicken Stir Fry',
    servings: 2,
    ingredients: [chicken(1), bellPepper(2), fresh('Broccoli', 1, 'head', 'produce', 5), item('Soy sauce', 3, 'tbsp', 'pantry'), rice(1)],
    notes: 'Cook the rice first. High heat, small batches.',
  },
  {
    id: 'fajitas',
    name: 'Chicken Fajitas',
    servings: 2,
    ingredients: [chicken(1), bellPepper(2), onion(1), tortillas(6), sourCream(0.5), cilantro(0.5)],
    notes: '',
  },
  {
    id: 'curry',
    name: 'Chickpea Spinach Curry',
    servings: 3,
    ingredients: [spinach(3), item('Coconut milk', 1, 'can', 'pantry'), item('Chickpeas', 1, 'can', 'pantry'), rice(1), onion(1), item('Curry paste', 2, 'tbsp', 'pantry')],
    notes: 'Stir the spinach in at the very end.',
  },
  {
    id: 'salmon-bowls',
    name: 'Salmon Rice Bowls',
    servings: 2,
    ingredients: [fresh('Salmon fillets', 0.75, 'lb', 'meat & fish', 2), rice(1), fresh('Cucumber', 1, 'each', 'produce', 7), spinach(2), item('Soy sauce', 2, 'tbsp', 'pantry')],
    notes: '',
  },
  {
    id: 'shepherds-pie',
    name: "Shepherd's Pie",
    servings: 4,
    ingredients: [beef(1), item('Potatoes', 2, 'lb', 'produce'), item('Frozen peas', 1, 'cup', 'frozen'), cream(0.5), onion(1)],
    notes: 'Makes enough for lunch the next day.',
  },
  {
    id: 'pesto-pasta',
    name: 'Creamy Pesto Pasta',
    servings: 2,
    ingredients: [chicken(0.5), item('Penne', 1, 'box', 'pantry'), item('Pesto', 0.5, 'cup', 'pantry'), cream(0.5), spinach(2), parmesan(0.25)],
    notes: '',
  },
  {
    id: 'caesar-wraps',
    name: 'Chicken Caesar Wraps',
    servings: 2,
    ingredients: [chicken(0.5), fresh('Romaine', 1, 'head', 'produce', 5), tortillas(4), parmesan(0.25), item('Caesar dressing', 0.25, 'cup', 'pantry')],
    notes: 'Good for using up leftover chicken.',
  },
  {
    id: 'minestrone',
    name: 'Minestrone Soup',
    servings: 4,
    ingredients: [spinach(2), item('Crushed tomatoes', 1, 'can', 'pantry'), item('Cannellini beans', 1, 'can', 'pantry'), item('Small pasta', 1, 'cup', 'pantry'), fresh('Carrots', 2, 'each', 'produce', 14), onion(1)],
    notes: '',
  },
  {
    id: 'breakfast-dinner',
    name: 'Breakfast for Dinner',
    servings: 2,
    ingredients: [fresh('Eggs', 6, 'each', 'dairy & eggs', 21, 12), fresh('Bacon', 0.5, 'lb', 'meat & fish', 7, 1), item('Bread', 4, 'slice', 'bakery'), fresh('Tomatoes', 2, 'each', 'produce', 5)],
    notes: 'Pancakes optional.',
  },
];
