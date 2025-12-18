import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Category {
  id: string;
  title: string;
  image: string;
  slug?: string;
}

export interface SubCategory {
  id: string;
  title: string;
  parentId: string;
  categoryId?: string;
  slug?: string;
}

export interface Item {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  available: boolean;
  stars?: number;
}

interface MenuState {
  categories: Category[];
  subCategories: SubCategory[];
  items: Item[];

  // Fetch menu from backend
  fetchMenu: () => Promise<void>;

  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Actions for resetting to default
  resetMenu: () => void;
}



// Assuming your types are defined elsewhere, or you can define them here
// interface MenuState { ... }

export const useMenu = create<MenuState>()(
  persist(
    (set, get) => ({
      categories: [],
      subCategories: [],
      items: [],

      fetchMenu: async () => {
        try {
          const categories: Category[] = [];
          const subCategories: SubCategory[] = [];
          const items: Item[] = [];

          // Try to get auth token if available (for admin or authenticated users)
          const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

          // Primary: Try /api/menu/organized endpoint (best for public users)
          try {
            const organizedUrl = `${API_BASE_URL}/api/menu/organized`;
            
            const organizedResponse = await fetch(organizedUrl, { headers }).then(r => r.json());

            let data = organizedResponse?.data || organizedResponse;
            if (Array.isArray(data) && data.length > 0) {
              data.forEach((categoryData: any) => {
                const category: Category = {
                  id: categoryData._id,
                  title: categoryData.name,
                  image: categoryData.image,
                  slug: categoryData.slug,
                };
                categories.push(category);

                if (Array.isArray(categoryData.subCategories)) {
                  categoryData.subCategories.forEach((subCatData: any) => {
                    const subCategory: SubCategory = {
                      id: subCatData._id,
                      title: subCatData.name,
                      parentId: categoryData._id,
                      slug: subCatData.slug,
                      categoryId: categoryData._id,
                    };
                    subCategories.push(subCategory);

                    if (Array.isArray(subCatData.dishes)) {
                      subCatData.dishes.forEach((dishData: any) => {
                        const item: Item = {
                          id: dishData._id,
                          title: dishData.name,
                          description: dishData.description,
                          price: dishData.price,
                          image: dishData.image,
                          available: dishData.available,
                          stars: dishData.stars,
                          categoryId: categoryData._id,
                          subCategoryId: subCatData._id,
                        };
                        items.push(item);
                      });
                    }
                  });
                }
              });
            }
          } catch (organizedError) {
          }

          // Fallback: Try /api/menu/dishes endpoint (same as admin uses)
          if (items.length === 0) {
            try {
              const dishesUrl = `${API_BASE_URL}/api/menu/dishes?limit=1000`;
              const dishesResponse = await fetch(dishesUrl, { headers }).then(r => r.json());

              let dishesArray = dishesResponse?.dishes || (Array.isArray(dishesResponse) ? dishesResponse : []);
              
              if (Array.isArray(dishesArray) && dishesArray.length > 0) {
                
                // Extract unique categories from dishes
                const categoryMap = new Map();
                const subCategoryMap = new Map();
                
                dishesArray.forEach((dishData: any) => {
                  const catId = dishData.category?._id || dishData.categoryId;
                  const subCatId = dishData.subCategory?._id || dishData.subCategoryId;
                  
                  // Add category
                  if (catId && !categoryMap.has(catId)) {
                    categoryMap.set(catId, {
                      id: catId,
                      title: dishData.category?.name || 'Uncategorized',
                      image: dishData.category?.image || 'https://via.placeholder.com/300',
                      slug: dishData.category?.slug,
                    });
                  }

                  // Add subcategory
                  if (subCatId && !subCategoryMap.has(subCatId)) {
                    subCategoryMap.set(subCatId, {
                      id: subCatId,
                      title: dishData.subCategory?.name || 'General',
                      parentId: catId,
                      categoryId: catId,
                      slug: dishData.subCategory?.slug,
                    });
                  }

                  // Add item
                  const item: Item = {
                    id: dishData._id,
                    title: dishData.name,
                    description: dishData.description,
                    price: dishData.price,
                    image: dishData.image,
                    available: dishData.available,
                    stars: dishData.stars,
                    categoryId: catId,
                    subCategoryId: subCatId,
                  };
                  items.push(item);
                });

                categories.push(...Array.from(categoryMap.values()));
                subCategories.push(...Array.from(subCategoryMap.values()));
              }
            } catch (dishesError) {
            }
          }

          // Last resort: Try standalone dishes
          if (items.length === 0) {
            try {
              const standaloneUrl = `${API_BASE_URL}/api/menu/dishes/standalone/all?limit=1000`;
              const standaloneResponse = await fetch(standaloneUrl, { headers }).then(r => r.json());

              let standaloneArray = standaloneResponse?.dishes || (Array.isArray(standaloneResponse) ? standaloneResponse : []);
              
              if (Array.isArray(standaloneArray) && standaloneArray.length > 0) {
                
                const categoryMap = new Map();
                standaloneArray.forEach((dishData: any) => {
                  const catId = dishData.category?._id || dishData.categoryId;
                  if (catId && !categoryMap.has(catId)) {
                    categoryMap.set(catId, {
                      id: catId,
                      title: dishData.category?.name || 'Uncategorized',
                      image: dishData.category?.image || 'https://via.placeholder.com/300',
                      slug: dishData.category?.slug,
                    });
                  }

                  const item: Item = {
                    id: dishData._id,
                    title: dishData.name,
                    description: dishData.description,
                    price: dishData.price,
                    image: dishData.image,
                    available: dishData.available,
                    stars: dishData.stars,
                    categoryId: catId,
                    subCategoryId: undefined,
                  };
                  items.push(item);
                });

                categories.push(...Array.from(categoryMap.values()));
              }
            } catch (standaloneError) {
            }
          }
          
          // Update state all at once
          set({ categories, subCategories, items });
          
        } catch (error) {
          toast({ title: "Error", description: "Failed to load menu data." });
        }
      },

      addItem: (item) => {
        const newItem = { ...item, id: `i${Date.now()}` };
        set((state) => ({ items: [...state.items, newItem] }));
        toast({ title: "Item Added", description: `${item.title} has been added.` });
      },

      updateItem: (id, updatedItem) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updatedItem } : i)),
        }));
        toast({ title: "Item Updated", description: "Changes have been saved." });
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
        toast({ title: "Item Deleted", description: "Item removed." });
      },

      addCategory: (category) => {
        const newCategory = { ...category, id: `c${Date.now()}` };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      resetMenu: () => {
        set({
          categories: [],
          subCategories: [],
          items: []
        });
        toast({ title: "Reset Complete", description: "Menu cleared." });
      }
    }),
    {
      name: 'fresh-squeeze-menu-storage',
    }
  )
);