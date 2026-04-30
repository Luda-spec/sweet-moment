import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;

  weight?: number;
  fillingName?: string;
};

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  restoreItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (value: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setIsOpen: (value) => set({ isOpen: value }),

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      restoreItem: (item) => {
        if (!item) return;

        set({
          items: [...get().items, item],
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter((item) => item.id !== id),
          });
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', 
    }
  )
);

export const useCartTotalPrice = () =>
  useCartStore((state) =>
    state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );

export const useCartTotalCount = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );