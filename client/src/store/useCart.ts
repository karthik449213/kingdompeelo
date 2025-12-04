import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/hooks/use-toast';

export interface Customization {
  noSugar?: boolean;
  addChilli?: boolean;
  extraToppings?: boolean;
  notes?: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  customizations?: Customization;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string, customizations?: Customization) => void;
  updateQuantity: (id: string, quantity: number, customizations?: Customization) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item) => {
        set((state) => {
          const customizationKey = JSON.stringify(item.customizations || {});
          const existingItem = state.items.find(
            (i) =>
              i.id === item.id &&
              JSON.stringify(i.customizations || {}) === customizationKey
          );
          toast({
            title: "Added to cart",
            description: `${item.title} added to your order.`,
          });
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id &&
                JSON.stringify(i.customizations || {}) === customizationKey
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
        });
      },
      removeFromCart: (id, customizations) => {
        set((state) => {
          if (!customizations) {
            return {
              items: state.items.filter((i) => i.id !== id),
            };
          }
          const customizationKey = JSON.stringify(customizations);
          return {
            items: state.items.filter(
              (i) =>
                !(i.id === id &&
                  JSON.stringify(i.customizations || {}) === customizationKey)
            ),
          };
        });
      },
      updateQuantity: (id, quantity, customizations) => {
        set((state) => {
          const customizationKey = customizations ? JSON.stringify(customizations) : '';
          return {
            items: state.items
              .map((i) =>
                i.id === id &&
                (!customizations ||
                  JSON.stringify(i.customizations || {}) === customizationKey)
                  ? { ...i, quantity: Math.max(0, quantity) }
                  : i
              )
              .filter((i) => i.quantity > 0),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => {
        const state = get();
        return state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
      itemCount: () => {
        const state = get();
        return state.items.reduce((acc, item) => acc + item.quantity, 0);
      }
    }),
    {
      name: 'gourmet-cart-storage',
    }
  )
);
