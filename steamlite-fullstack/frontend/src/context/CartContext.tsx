import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { Cart } from "../types";
import { useAuth } from "./AuthContext";

type CartContextType = {
  cartCount: number;
  refreshCart: () => Promise<void>;
  setCartCount: (value: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const response = await apiRequest<{ cart: Cart }>("/cart");
      setCartCount(response.cart.totalItems);
    } catch (_error) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user?.id]);

  const value = useMemo(
    () => ({
      cartCount,
      refreshCart,
      setCartCount,
    }),
    [cartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
};
