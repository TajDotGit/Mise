import type { CatalogIngredient, Section, Unit } from '../../domain/schemas';

/*
 * The pre-loaded ingredient catalog. Recipes reference these ids, so names,
 * units, and keeping times stay consistent everywhere.
 *
 * Shelf life = typical fridge/pantry days after purchase (rounded, conservative).
 * Pack size  = typical amount sold, in the first (default) unit.
 * Only perishables get a pack size: leftovers are only tracked for things that spoil.
 * Later phases seed the database table from this file.
 */

interface Opts {
  /** Perishable: keeps this many days. */
  keeps?: number;
  /** Sold in packs of this size (default unit). */
  pack?: number;
  /** Extra search terms. */
  aka?: string[];
}

type Row = [id: string, name: string, units: Unit[], opts?: Opts];

function group(section: Section, subsection: string, rows: Row[]): CatalogIngredient[] {
  return rows.map(([id, name, units, opts = {}]) => ({
    id,
    name,
    section,
    subsection,
    units,
    perishable: opts.keeps !== undefined,
    ...(opts.keeps !== undefined ? { shelfLifeDays: opts.keeps } : {}),
    ...(opts.pack !== undefined ? { packSize: opts.pack } : {}),
    aliases: opts.aka ?? [],
  }));
}

export const ingredientCatalog: CatalogIngredient[] = [
  // ── Produce ──────────────────────────────────────────────
  ...group('produce', 'Vegetables', [
    ['bell-pepper', 'Bell pepper', ['each'], { keeps: 7, aka: ['capsicum', 'sweet pepper'] }],
    ['broccoli', 'Broccoli', ['head', 'cup'], { keeps: 5 }],
    ['cauliflower', 'Cauliflower', ['head', 'cup'], { keeps: 7 }],
    ['carrot', 'Carrots', ['each', 'lb', 'cup'], { keeps: 21 }],
    ['celery', 'Celery', ['stalk', 'bunch'], { keeps: 14 }],
    ['cucumber', 'Cucumber', ['each'], { keeps: 7 }],
    ['zucchini', 'Zucchini', ['each'], { keeps: 5, aka: ['courgette'] }],
    ['eggplant', 'Eggplant', ['each'], { keeps: 5, aka: ['aubergine'] }],
    ['green-beans', 'Green beans', ['lb', 'cup'], { keeps: 5, pack: 1, aka: ['string beans'] }],
    ['corn-on-the-cob', 'Corn on the cob', ['each'], { keeps: 3, aka: ['sweetcorn'] }],
    ['mushrooms', 'Mushrooms', ['oz', 'cup'], { keeps: 5, pack: 8 }],
    ['tomato', 'Tomatoes', ['each', 'lb'], { keeps: 5 }],
    ['cherry-tomatoes', 'Cherry tomatoes', ['cup'], { keeps: 5, pack: 2 }],
    ['asparagus', 'Asparagus', ['bunch'], { keeps: 4 }],
    ['brussels-sprouts', 'Brussels sprouts', ['lb', 'cup'], { keeps: 5, pack: 1 }],
    ['cabbage', 'Cabbage', ['head', 'cup'], { keeps: 14 }],
    ['snap-peas', 'Snap peas', ['cup', 'oz'], { keeps: 5, pack: 3, aka: ['snow peas', 'mangetout'] }],
    ['jalapeno', 'Jalapeño', ['each'], { keeps: 7, aka: ['jalapeno', 'chili pepper'] }],
  ]),
  ...group('produce', 'Leafy greens', [
    ['baby-spinach', 'Baby spinach', ['cup', 'oz'], { keeps: 3, pack: 5 }],
    ['romaine', 'Romaine lettuce', ['head'], { keeps: 5, aka: ['cos', 'lettuce'] }],
    ['iceberg-lettuce', 'Iceberg lettuce', ['head'], { keeps: 7, aka: ['lettuce'] }],
    ['mixed-greens', 'Mixed salad greens', ['cup', 'oz'], { keeps: 4, pack: 5, aka: ['salad', 'spring mix'] }],
    ['kale', 'Kale', ['bunch', 'cup'], { keeps: 5 }],
    ['arugula', 'Arugula', ['cup', 'oz'], { keeps: 3, pack: 5, aka: ['rocket'] }],
    ['bok-choy', 'Bok choy', ['head'], { keeps: 4, aka: ['pak choi'] }],
  ]),
  ...group('produce', 'Roots & potatoes', [
    ['potato', 'Potatoes', ['lb', 'each'], { aka: ['russet'] }],
    ['sweet-potato', 'Sweet potatoes', ['each', 'lb'], { aka: ['yam'] }],
    ['baby-potatoes', 'Baby potatoes', ['lb'], { aka: ['new potatoes'] }],
    ['beet', 'Beets', ['each'], { keeps: 14, aka: ['beetroot'] }],
    ['parsnip', 'Parsnips', ['each'], { keeps: 21 }],
  ]),
  ...group('produce', 'Onions & garlic', [
    ['onion', 'Onion', ['each', 'cup'], { aka: ['yellow onion', 'brown onion'] }],
    ['red-onion', 'Red onion', ['each']],
    ['shallot', 'Shallot', ['each']],
    ['green-onion', 'Green onions', ['bunch', 'stalk'], { keeps: 7, aka: ['scallions', 'spring onions'] }],
    ['garlic', 'Garlic', ['clove', 'head']],
    ['ginger', 'Ginger', ['tbsp', 'oz'], { aka: ['ginger root'] }],
    ['leek', 'Leek', ['each'], { keeps: 10 }],
  ]),
  ...group('produce', 'Fresh herbs', [
    ['cilantro', 'Cilantro', ['bunch', 'cup'], { keeps: 2, pack: 1, aka: ['coriander'] }],
    ['parsley', 'Parsley', ['bunch', 'cup'], { keeps: 5, pack: 1 }],
    ['basil', 'Basil', ['bunch', 'cup'], { keeps: 3, pack: 1 }],
    ['mint', 'Mint', ['bunch', 'sprig'], { keeps: 5, pack: 1 }],
    ['dill', 'Dill', ['bunch', 'sprig'], { keeps: 5, pack: 1 }],
    ['rosemary', 'Rosemary', ['sprig', 'bunch'], { keeps: 10 }],
    ['thyme', 'Thyme', ['sprig', 'bunch'], { keeps: 10 }],
    ['chives', 'Chives', ['bunch', 'tbsp'], { keeps: 5, pack: 1 }],
  ]),
  ...group('produce', 'Fruit', [
    ['lemon', 'Lemon', ['each'], { keeps: 21 }],
    ['lime', 'Lime', ['each'], { keeps: 21 }],
    ['avocado', 'Avocado', ['each'], { keeps: 3 }],
    ['apple', 'Apples', ['each'], { keeps: 30 }],
    ['banana', 'Bananas', ['each'], { keeps: 5 }],
    ['orange', 'Oranges', ['each'], { keeps: 21 }],
    ['berries', 'Mixed berries', ['cup'], { keeps: 4, pack: 2, aka: ['strawberries', 'blueberries'] }],
    ['pineapple', 'Pineapple', ['each', 'cup'], { keeps: 4 }],
    ['mango', 'Mango', ['each'], { keeps: 5 }],
  ]),

  // ── Meat & seafood ───────────────────────────────────────
  ...group('meat & seafood', 'Beef', [
    ['ground-beef', 'Ground beef', ['lb'], { keeps: 2, pack: 1, aka: ['mince', 'minced beef', 'hamburger'] }],
    ['steak', 'Steak', ['lb', 'each'], { keeps: 3, pack: 1, aka: ['sirloin', 'ribeye'] }],
    ['stew-beef', 'Stewing beef', ['lb'], { keeps: 3, pack: 1, aka: ['chuck', 'beef chunks'] }],
    ['beef-strips', 'Beef strips', ['lb'], { keeps: 2, pack: 1, aka: ['stir fry beef'] }],
  ]),
  ...group('meat & seafood', 'Poultry', [
    ['chicken-breast', 'Chicken breast', ['lb'], { keeps: 2, pack: 1.5 }],
    ['chicken-thighs', 'Chicken thighs', ['lb'], { keeps: 2, pack: 2 }],
    ['whole-chicken', 'Whole chicken', ['each'], { keeps: 2 }],
    ['ground-turkey', 'Ground turkey', ['lb'], { keeps: 2, pack: 1, aka: ['turkey mince'] }],
    ['chicken-wings', 'Chicken wings', ['lb'], { keeps: 2, pack: 2 }],
  ]),
  ...group('meat & seafood', 'Pork', [
    ['bacon', 'Bacon', ['lb', 'slice'], { keeps: 7, pack: 1 }],
    ['ground-pork', 'Ground pork', ['lb'], { keeps: 2, pack: 1, aka: ['pork mince'] }],
    ['pork-chops', 'Pork chops', ['each', 'lb'], { keeps: 3 }],
    ['sausages', 'Sausages', ['each', 'lb'], { keeps: 3, pack: 6, aka: ['bratwurst', 'italian sausage'] }],
    ['ham', 'Sliced ham', ['oz', 'slice'], { keeps: 5, pack: 8, aka: ['deli ham'] }],
    ['chorizo', 'Chorizo', ['oz'], { keeps: 14, pack: 8 }],
  ]),
  ...group('meat & seafood', 'Seafood', [
    ['salmon', 'Salmon fillets', ['lb', 'each'], { keeps: 2, pack: 1 }],
    ['cod', 'Cod fillets', ['lb', 'each'], { keeps: 2, pack: 1, aka: ['white fish', 'haddock'] }],
    ['shrimp', 'Shrimp', ['lb'], { keeps: 2, pack: 1, aka: ['prawns'] }],
    ['tuna-steak', 'Tuna steaks', ['each', 'lb'], { keeps: 2 }],
    ['tilapia', 'Tilapia fillets', ['lb', 'each'], { keeps: 2, pack: 1 }],
  ]),

  // ── Dairy & eggs ─────────────────────────────────────────
  ...group('dairy & eggs', 'Eggs', [['eggs', 'Eggs', ['each'], { keeps: 21, pack: 12 }]]),
  ...group('dairy & eggs', 'Milk & cream', [
    ['milk', 'Milk', ['cup', 'l'], { keeps: 7, pack: 8, aka: ['whole milk'] }],
    ['heavy-cream', 'Heavy cream', ['cup', 'tbsp'], { keeps: 7, pack: 1, aka: ['double cream', 'whipping cream'] }],
    ['half-and-half', 'Half and half', ['cup'], { keeps: 7, pack: 2, aka: ['single cream'] }],
    ['buttermilk', 'Buttermilk', ['cup'], { keeps: 10, pack: 4 }],
  ]),
  ...group('dairy & eggs', 'Cheese', [
    ['cheddar', 'Cheddar', ['cup', 'oz'], { keeps: 21, pack: 2, aka: ['cheese', 'shredded cheese'] }],
    ['mozzarella', 'Mozzarella', ['cup', 'oz'], { keeps: 14, pack: 2 }],
    ['parmesan', 'Parmesan', ['cup', 'tbsp', 'oz'], { keeps: 21, pack: 1, aka: ['parmigiano', 'parm'] }],
    ['feta', 'Feta', ['oz', 'cup'], { keeps: 7, pack: 6 }],
    ['cream-cheese', 'Cream cheese', ['oz', 'tbsp'], { keeps: 14, pack: 8 }],
    ['ricotta', 'Ricotta', ['cup'], { keeps: 5, pack: 2 }],
    ['goat-cheese', 'Goat cheese', ['oz'], { keeps: 7, pack: 4, aka: ['chevre'] }],
    ['monterey-jack', 'Monterey Jack', ['cup', 'oz'], { keeps: 21, pack: 2, aka: ['pepper jack'] }],
  ]),
  ...group('dairy & eggs', 'Butter & yogurt', [
    ['butter', 'Butter', ['tbsp', 'cup'], { keeps: 30, pack: 32 }],
    ['sour-cream', 'Sour cream', ['cup', 'tbsp'], { keeps: 10, pack: 1 }],
    ['greek-yogurt', 'Greek yogurt', ['cup'], { keeps: 10, pack: 2, aka: ['yoghurt'] }],
  ]),

  // ── Bakery ───────────────────────────────────────────────
  ...group('bakery', 'Bread', [
    ['bread', 'Sandwich bread', ['slice'], { keeps: 5, pack: 20, aka: ['loaf'] }],
    ['baguette', 'Baguette', ['each'], { keeps: 2 }],
    ['burger-buns', 'Burger buns', ['each'], { keeps: 5, pack: 8, aka: ['rolls'] }],
    ['pita', 'Pita bread', ['each'], { keeps: 5, pack: 6 }],
    ['naan', 'Naan', ['each'], { keeps: 5, pack: 4, aka: ['flatbread'] }],
  ]),
  ...group('bakery', 'Wraps & tortillas', [
    ['flour-tortillas', 'Flour tortillas', ['each'], { keeps: 7, pack: 10, aka: ['wraps'] }],
    ['corn-tortillas', 'Corn tortillas', ['each'], { keeps: 7, pack: 12 }],
    ['taco-shells', 'Hard taco shells', ['each']],
  ]),

  // ── Beans & legumes ──────────────────────────────────────
  ...group('beans & legumes', 'Canned beans', [
    ['chickpeas', 'Chickpeas', ['can', 'cup'], { aka: ['garbanzo'] }],
    ['black-beans', 'Black beans', ['can', 'cup']],
    ['kidney-beans', 'Kidney beans', ['can', 'cup']],
    ['cannellini-beans', 'Cannellini beans', ['can', 'cup'], { aka: ['white beans'] }],
    ['pinto-beans', 'Pinto beans', ['can', 'cup']],
    ['refried-beans', 'Refried beans', ['can']],
    ['baked-beans', 'Baked beans', ['can']],
  ]),
  ...group('beans & legumes', 'Dried & lentils', [
    ['red-lentils', 'Red lentils', ['cup'], { aka: ['dal'] }],
    ['green-lentils', 'Green lentils', ['cup'], { aka: ['brown lentils'] }],
    ['split-peas', 'Split peas', ['cup']],
  ]),
  ...group('beans & legumes', 'Tofu & tempeh', [
    ['tofu', 'Firm tofu', ['oz', 'cup'], { keeps: 5, pack: 14, aka: ['bean curd'] }],
    ['tempeh', 'Tempeh', ['oz'], { keeps: 7, pack: 8 }],
  ]),

  // ── Dry goods ────────────────────────────────────────────
  ...group('dry goods', 'Pasta & noodles', [
    ['spaghetti', 'Spaghetti', ['box', 'oz'], { aka: ['pasta'] }],
    ['penne', 'Penne', ['box', 'oz'], { aka: ['pasta'] }],
    ['fusilli', 'Fusilli', ['box', 'oz'], { aka: ['rotini', 'pasta'] }],
    ['small-pasta', 'Small pasta', ['cup'], { aka: ['ditalini', 'orzo', 'macaroni'] }],
    ['lasagna-sheets', 'Lasagna sheets', ['box', 'each']],
    ['egg-noodles', 'Egg noodles', ['oz', 'bag']],
    ['rice-noodles', 'Rice noodles', ['oz', 'box'], { aka: ['vermicelli'] }],
    ['ramen-noodles', 'Ramen noodles', ['each'], { aka: ['instant noodles'] }],
  ]),
  ...group('dry goods', 'Rice & grains', [
    ['white-rice', 'White rice', ['cup'], { aka: ['long grain', 'jasmine', 'basmati', 'rice'] }],
    ['brown-rice', 'Brown rice', ['cup'], { aka: ['rice'] }],
    ['arborio-rice', 'Arborio rice', ['cup'], { aka: ['risotto rice'] }],
    ['quinoa', 'Quinoa', ['cup']],
    ['couscous', 'Couscous', ['cup']],
    ['rolled-oats', 'Rolled oats', ['cup'], { aka: ['oatmeal', 'porridge'] }],
  ]),
  ...group('dry goods', 'Baking', [
    ['flour', 'All-purpose flour', ['cup', 'tbsp'], { aka: ['plain flour'] }],
    ['sugar', 'Sugar', ['cup', 'tbsp', 'tsp'], { aka: ['white sugar', 'granulated'] }],
    ['brown-sugar', 'Brown sugar', ['cup', 'tbsp']],
    ['baking-powder', 'Baking powder', ['tsp']],
    ['baking-soda', 'Baking soda', ['tsp'], { aka: ['bicarbonate'] }],
    ['cornstarch', 'Cornstarch', ['tbsp', 'tsp'], { aka: ['cornflour'] }],
    ['breadcrumbs', 'Breadcrumbs', ['cup'], { aka: ['panko'] }],
  ]),
  ...group('dry goods', 'Nuts & seeds', [
    ['peanuts', 'Peanuts', ['cup']],
    ['cashews', 'Cashews', ['cup']],
    ['almonds', 'Almonds', ['cup']],
    ['sesame-seeds', 'Sesame seeds', ['tbsp']],
    ['pine-nuts', 'Pine nuts', ['tbsp', 'cup']],
  ]),

  // ── Canned & jarred ──────────────────────────────────────
  ...group('canned & jarred', 'Tomatoes', [
    ['crushed-tomatoes', 'Crushed tomatoes', ['can'], { aka: ['tinned tomatoes'] }],
    ['diced-tomatoes', 'Diced tomatoes', ['can'], { aka: ['chopped tomatoes'] }],
    ['tomato-paste', 'Tomato paste', ['tbsp', 'can'], { aka: ['tomato puree'] }],
    ['passata', 'Tomato passata', ['cup', 'jar'], { aka: ['tomato sauce'] }],
    ['marinara', 'Marinara sauce', ['jar', 'cup'], { aka: ['pasta sauce'] }],
  ]),
  ...group('canned & jarred', 'Broth & stock', [
    ['chicken-broth', 'Chicken broth', ['cup'], { aka: ['chicken stock'] }],
    ['vegetable-broth', 'Vegetable broth', ['cup'], { aka: ['vegetable stock'] }],
    ['beef-broth', 'Beef broth', ['cup'], { aka: ['beef stock'] }],
  ]),
  ...group('canned & jarred', 'Other canned', [
    ['coconut-milk', 'Coconut milk', ['can', 'cup']],
    ['canned-tuna', 'Canned tuna', ['can']],
    ['canned-corn', 'Canned corn', ['can', 'cup'], { aka: ['sweetcorn'] }],
    ['olives', 'Olives', ['cup', 'jar']],
    ['capers', 'Capers', ['tbsp']],
    ['roasted-peppers', 'Roasted red peppers', ['jar', 'cup']],
  ]),

  // ── Condiments & sauces ──────────────────────────────────
  ...group('condiments & sauces', 'Asian sauces', [
    ['soy-sauce', 'Soy sauce', ['tbsp', 'tsp'], { aka: ['tamari', 'shoyu'] }],
    ['oyster-sauce', 'Oyster sauce', ['tbsp']],
    ['fish-sauce', 'Fish sauce', ['tbsp', 'tsp']],
    ['hoisin', 'Hoisin sauce', ['tbsp']],
    ['sriracha', 'Sriracha', ['tbsp', 'tsp'], { aka: ['hot sauce', 'chili sauce'] }],
    ['curry-paste', 'Curry paste', ['tbsp'], { aka: ['red curry', 'green curry'] }],
    ['teriyaki', 'Teriyaki sauce', ['tbsp', 'cup']],
  ]),
  ...group('condiments & sauces', 'Everyday condiments', [
    ['ketchup', 'Ketchup', ['tbsp']],
    ['mayonnaise', 'Mayonnaise', ['tbsp', 'cup'], { aka: ['mayo'] }],
    ['mustard', 'Dijon mustard', ['tbsp', 'tsp'], { aka: ['mustard'] }],
    ['bbq-sauce', 'BBQ sauce', ['tbsp', 'cup'], { aka: ['barbecue'] }],
    ['hot-sauce', 'Hot sauce', ['tsp', 'tbsp']],
    ['salsa', 'Salsa', ['cup', 'jar']],
    ['pesto', 'Pesto', ['cup', 'tbsp', 'jar']],
    ['caesar-dressing', 'Caesar dressing', ['cup', 'tbsp']],
    ['worcestershire', 'Worcestershire sauce', ['tbsp', 'tsp']],
    ['honey', 'Honey', ['tbsp', 'tsp']],
    ['maple-syrup', 'Maple syrup', ['tbsp', 'cup']],
    ['peanut-butter', 'Peanut butter', ['tbsp', 'cup']],
  ]),

  // ── Oils & vinegars ──────────────────────────────────────
  ...group('oils & vinegars', 'Oils', [
    ['olive-oil', 'Olive oil', ['tbsp', 'cup'], { aka: ['evoo'] }],
    ['vegetable-oil', 'Vegetable oil', ['tbsp', 'cup'], { aka: ['canola', 'sunflower oil', 'frying oil'] }],
    ['sesame-oil', 'Sesame oil', ['tsp', 'tbsp']],
    ['cooking-spray', 'Cooking spray', ['each']],
  ]),
  ...group('oils & vinegars', 'Vinegars', [
    ['balsamic-vinegar', 'Balsamic vinegar', ['tbsp']],
    ['red-wine-vinegar', 'Red wine vinegar', ['tbsp']],
    ['rice-vinegar', 'Rice vinegar', ['tbsp']],
    ['apple-cider-vinegar', 'Apple cider vinegar', ['tbsp']],
  ]),

  // ── Spices & seasonings ──────────────────────────────────
  ...group('spices & seasonings', 'Basics', [
    ['salt', 'Salt', ['tsp', 'pinch'], { aka: ['kosher salt', 'sea salt'] }],
    ['black-pepper', 'Black pepper', ['tsp', 'pinch'], { aka: ['pepper'] }],
    ['garlic-powder', 'Garlic powder', ['tsp']],
    ['onion-powder', 'Onion powder', ['tsp']],
  ]),
  ...group('spices & seasonings', 'Spices', [
    ['cumin', 'Ground cumin', ['tsp', 'tbsp']],
    ['paprika', 'Paprika', ['tsp', 'tbsp'], { aka: ['smoked paprika'] }],
    ['chili-powder', 'Chili powder', ['tsp', 'tbsp']],
    ['chili-flakes', 'Red pepper flakes', ['tsp', 'pinch'], { aka: ['chili flakes', 'crushed red pepper'] }],
    ['cinnamon', 'Cinnamon', ['tsp']],
    ['turmeric', 'Turmeric', ['tsp']],
    ['curry-powder', 'Curry powder', ['tsp', 'tbsp']],
    ['garam-masala', 'Garam masala', ['tsp', 'tbsp']],
    ['coriander-ground', 'Ground coriander', ['tsp']],
    ['nutmeg', 'Nutmeg', ['tsp', 'pinch']],
  ]),
  ...group('spices & seasonings', 'Dried herbs & blends', [
    ['oregano', 'Dried oregano', ['tsp']],
    ['italian-seasoning', 'Italian seasoning', ['tsp', 'tbsp'], { aka: ['mixed herbs'] }],
    ['dried-thyme', 'Dried thyme', ['tsp']],
    ['bay-leaves', 'Bay leaves', ['each']],
    ['taco-seasoning', 'Taco seasoning', ['tbsp', 'tsp'], { aka: ['fajita seasoning'] }],
    ['vanilla-extract', 'Vanilla extract', ['tsp']],
  ]),

  // ── Frozen ───────────────────────────────────────────────
  ...group('frozen', 'Frozen vegetables', [
    ['frozen-peas', 'Frozen peas', ['cup', 'bag']],
    ['frozen-corn', 'Frozen corn', ['cup', 'bag']],
    ['frozen-mixed-veg', 'Frozen mixed vegetables', ['cup', 'bag']],
    ['frozen-spinach', 'Frozen spinach', ['cup', 'bag']],
    ['frozen-stir-fry-veg', 'Frozen stir-fry vegetables', ['cup', 'bag']],
  ]),
  ...group('frozen', 'Frozen other', [
    ['frozen-fries', 'Frozen fries', ['bag', 'cup'], { aka: ['chips', 'oven chips'] }],
    ['frozen-berries', 'Frozen berries', ['cup', 'bag']],
    ['frozen-dumplings', 'Frozen dumplings', ['each', 'bag'], { aka: ['potstickers', 'gyoza'] }],
    ['puff-pastry', 'Puff pastry', ['each'], { aka: ['pastry sheet'] }],
  ]),
];
