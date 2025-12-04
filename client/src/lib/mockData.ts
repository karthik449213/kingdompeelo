import heroImg from '@assets/generated_images/bright_and_airy_juice_bar_interior_with_fresh_fruits_on_display..png';
import juiceImg from '@assets/generated_images/freshly_squeezed_orange_and_mango_juice_in_a_glass..png';
import iceCreamImg from '@assets/generated_images/gourmet_strawberry_sundae_ice_cream..png';
import dessertImg from '@assets/generated_images/fresh_fruit_tart_dessert..png';

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
    title: 'Fresh Juices',
    image: juiceImg,
    slug: 'fresh-juices'
  },
  {
    id: 'c2',
    title: 'Ice Creams',
    image: iceCreamImg,
    slug: 'ice-creams'
  },
  {
    id: 'c3',
    title: 'Desserts',
    image: dessertImg,
    slug: 'desserts'
  }
];

export const subCategories: SubCategory[] = [
  { id: 'sc1', categoryId: 'c1', title: 'Detox Blends', slug: 'detox' },
  { id: 'sc2', categoryId: 'c1', title: 'Fruit Smoothies', slug: 'smoothies' },
  { id: 'sc3', categoryId: 'c2', title: 'Sundaes', slug: 'sundaes' },
  { id: 'sc4', categoryId: 'c2', title: 'Scoops', slug: 'scoops' },
  { id: 'sc5', categoryId: 'c3', title: 'Fruit Tarts', slug: 'fruit-tarts' },
  { id: 'sc6', categoryId: 'c3', title: 'Puddings', slug: 'puddings' },
];

export const items: Item[] = [
  {
    id: 'i1',
    subCategoryId: 'sc1',
    title: 'Sunrise Citrus',
    description: 'Freshly squeezed oranges, mango, and a hint of mint for a morning boost.',
    price: 8.50,
    image: juiceImg,
    popular: true
  },
  {
    id: 'i2',
    subCategoryId: 'sc1',
    title: 'Green Glow',
    description: 'Kale, cucumber, apple, lemon, and ginger. The ultimate detox.',
    price: 9.00,
    image: juiceImg // Placeholder reuse
  },
  {
    id: 'i3',
    subCategoryId: 'sc3',
    title: 'Berry Bliss Sundae',
    description: 'Creamy vanilla bean ice cream topped with fresh strawberries and house-made syrup.',
    price: 7.50,
    image: iceCreamImg,
    popular: true
  },
  {
    id: 'i4',
    subCategoryId: 'sc5',
    title: 'Tropical Fruit Tart',
    description: 'Buttery pastry shell filled with custard and topped with seasonal kiwi and berries.',
    price: 6.50,
    image: dessertImg,
    popular: true
  },
  {
    id: 'i5',
    subCategoryId: 'sc2',
    title: 'Mango Madness',
    description: 'Rich mango smoothie blended with yogurt and honey.',
    price: 8.00,
    image: juiceImg // Placeholder reuse
  },
  {
    id: 'i6',
    subCategoryId: 'sc4',
    title: 'Double Chocolate Scoop',
    description: 'Premium dark chocolate ice cream made with Belgian cocoa.',
    price: 5.00,
    image: iceCreamImg // Placeholder reuse
  }
];

export const stats = [
  { label: "Juices Sold", value: "1,250", change: "+15%" },
  { label: "Active Orders", value: "18", change: "+2" },
  { label: "New Customers", value: "85", change: "+10%" },
  { label: "Flavors", value: "32", change: "+4" },
];
