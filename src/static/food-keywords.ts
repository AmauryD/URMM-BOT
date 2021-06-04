const general = [
  "Epicure",
  "Gastronomy",
  "Gourmet",
  "Food plate",
  "Foodporn",
  "Platter",
  "Restaurant food",
];

export const breakfast = [
  "Breakfast",
  "Pancakes",
  "Syrup",
  "Blackberries",
  "Bread",
  "Eggs meal plate",
  "Brunch",
  "Yoghurt",
];
export const midday = [
  "Sandwich",
  "Grill",
  "Grilled chicken",
  "Grilled steak",
  "Bread",
  "Burger",
  "Cheese",
  "Pepperoni",
  "Mozzarella",
  "Sauce",
  "Bacon",
  "Salad",
  "Grilled sandwich",
  "Tapas",
  "Cheese pizza",
  ...general,
];

export const gouter = [
  "Cake",
  "Macaroon",
  "Dessert",
  "Berries",
  "Slice of cake",
  "Pie",
];

export const dinner = [
  "Grill",
  "Grilled chicken",
  "Grilled steak",
  "Shrimps",
  "Burger",
  "Cheese",
  "Baked potatoes ",
  "Cooked salmon",
  "Tapas",
  "Fish plate",
  "Chicken plate",
  ...general,
];

export const all = [...general, ...dinner, ...gouter, ...breakfast, ...midday];
