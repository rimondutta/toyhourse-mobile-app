import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@/types";

interface WishlistState {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      wishlist: [],
      addToWishlist: (product) =>
        set((state) => {
          if (state.wishlist.find((p) => p._id === product._id)) {
            return state;
          }
          return { wishlist: [...state.wishlist, product] };
        }),
      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((p) => p._id !== productId),
        })),
    }),
    {
      name: "toyhourse-wishlist-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Wrapper hook to keep the same API signature as before
const useWishlist = () => {
  const store = useWishlistStore();

  const isInWishlist = (productId: string) => {
    return store.wishlist.some((product) => product._id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      store.removeFromWishlist(product._id);
    } else {
      store.addToWishlist(product);
    }
  };

  return {
    wishlist: store.wishlist,
    isLoading: false,
    isError: false,
    wishlistCount: store.wishlist.length,
    isInWishlist,
    toggleWishlist,
    addToWishlist: store.addToWishlist,
    removeFromWishlist: store.removeFromWishlist,
    isAddingToWishlist: false,
    isRemovingFromWishlist: false,
  };
};

export default useWishlist;
