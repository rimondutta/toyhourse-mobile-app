import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem } from "@/types";

interface CartState {
  cart: { items: CartItem[] };
  addToCart: (params: { productId: string; product: any; quantity?: number }) => void;
  updateQuantity: (params: { productId: string; quantity: number }) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: { items: [] },
      addToCart: ({ productId, product, quantity = 1 }) =>
        set((state) => {
          const existingItem = state.cart.items.find((item) => item.product._id === productId);
          if (existingItem) {
            return {
              cart: {
                ...state.cart,
                items: state.cart.items.map((item) =>
                  item.product._id === productId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
              },
            };
          }
          return {
            cart: {
              ...state.cart,
              items: [
                ...state.cart.items,
                { _id: Math.random().toString(36).substring(7), product, quantity },
              ],
            },
          };
        }),
      updateQuantity: ({ productId, quantity }) =>
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.product._id === productId ? { ...item, quantity } : item
            ),
          },
        })),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.filter((item) => item.product._id !== productId),
          },
        })),
      clearCart: () => set({ cart: { items: [] } }),
    }),
    {
      name: "toyhourse-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Wrapper hook to keep the same API signature as before
const useCart = () => {
  const store = useCartStore();

  const cartTotal =
    store.cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  const cartItemCount = store.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart: store.cart,
    isLoading: false, // Local state is instant
    isError: false,
    cartTotal,
    cartItemCount,
    addToCart: store.addToCart,
    updateQuantity: store.updateQuantity,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,
    isAddingToCart: false,
    isUpdating: false,
    isRemoving: false,
    isClearing: false,
  };
};

export default useCart;

