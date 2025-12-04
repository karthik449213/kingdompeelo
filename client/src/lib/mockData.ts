import heroImg from '@assets/generated_images/high-end_restaurant_interior_with_moody_lighting_and_elegant_table_settings..png';
import burgerImg from '@assets/generated_images/gourmet_burger_with_fries_on_a_wooden_board..png';
import drinkImg from '@assets/generated_images/colorful_cocktail_drink_with_garnish..png';
import dessertImg from '@assets/generated_images/decadent_chocolate_lava_cake_dessert..png';

export interface Category {
  id: string;
  title: string;
  image: string;
  slug: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
}

export interface Item {
  id: string;
  subCategoryId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
}

export const categories: Category[] = [
  {
    id: 'c1',
    title: 'Main Course',
    image: burgerImg,
    slug: 'main-course'
  },
  {
    id: 'c2',
    title: 'Beverages',
    image: drinkImg,
    slug: 'beverages'
  },
  {
    id: 'c3',
    title: 'Desserts',
    image: dessertImg,
    slug: 'desserts'
  }
];

export const subCategories: SubCategory[] = [
  { id: 'sc1', categoryId: 'c1', title: 'Burgers', slug: 'burgers' },
  { id: 'sc2', categoryId: 'c1', title: 'Steaks', slug: 'steaks' },
  { id: 'sc3', categoryId: 'c2', title: 'Cocktails', slug: 'cocktails' },
  { id: 'sc4', categoryId: 'c2', title: 'Coffee', slug: 'coffee' },
  { id: 'sc5', categoryId: 'c3', title: 'Cakes', slug: 'cakes' },
];

export const items: Item[] = [
  {
    id: 'i1',
    subCategoryId: 'sc1',
    title: 'The Gourmet Signature',
    description: 'Wagyu beef patty, truffle aioli, aged cheddar, caramelized onions on a brioche bun.',
    price: 18.50,
    image: burgerImg,
    popular: true
  },
  {
    id: 'i2',
    subCategoryId: 'sc1',
    title: 'Crispy Chicken Deluxe',
    description: 'Buttermilk fried chicken, spicy slaw, pickles, house sauce.',
    price: 14.00,
    image: burgerImg // Placeholder reuse
  },
  {
    id: 'i3',
    subCategoryId: 'sc3',
    title: 'Sunset Boulevard',
    description: 'Gin, Aperol, fresh citrus, mint garnish.',
    price: 12.00,
    image: drinkImg,
    popular: true
  },
  {
    id: 'i4',
    subCategoryId: 'sc5',
    title: 'Molten Lava Cake',
    description: 'Rich dark chocolate cake with a gooey center, served with vanilla bean ice cream.',
    price: 9.50,
    image: dessertImg,
    popular: true
  },
  {
    id: 'i5',
    subCategoryId: 'sc5',
    title: 'Tiramisu',
    description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.',
    price: 8.50,
    image: dessertImg // Placeholder reuse
  }
];

export const stats = [
  { label: "Total Revenue", value: "$12,450", change: "+12%" },
  { label: "Active Orders", value: "24", change: "+4" },
  { label: "New Customers", value: "145", change: "+18%" },
  { label: "Menu Items", value: "42", change: "0" },
];
