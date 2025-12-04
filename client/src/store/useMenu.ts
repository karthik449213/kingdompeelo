import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { categories as initialCategories, subCategories as initialSubCategories, items as initialItems, Category, SubCategory, Item } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

interface MenuState {
  categories: Category[];
  subCategories: SubCategory[];
  items: Item[];
  
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  
  // Actions for resetting to default
  resetMenu: () => void;
}

export const useMenu = create<MenuState>()(
  persist(
    (set) => ({
      categories: initialCategories,
      subCategories: initialSubCategories,
      items: initialItems,

      addItem: (item) => {
        const newItem = { ...item, id: `i${Date.now()}` };
        set((state) => ({ items: [...state.items, newItem] }));
        toast({ title: "Item Added", description: `${item.title} has been added to the menu.` });
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
        toast({ title: "Item Deleted", description: "Item has been removed from the menu." });
      },

      addCategory: (category) => {
        const newCategory = { ...category, id: `c${Date.now()}` };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          // Optional: cascade delete items or keep them? Let's keep them for now or generic 'uncategorized'
        }));
      },

      resetMenu: () => {
        set({
          categories: initialCategories,
          subCategories: initialSubCategories,
          items: initialItems
        });
        toast({ title: "Reset Complete", description: "Menu restored to default." });
      }
    }),
    {
      name: 'fresh-squeeze-menu-storage',
    }
  )
);
