import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AddToCartResult, PublicCartItem, PublicCartProduct } from './publicCart.types';
import { getCartItemLimit, toCartItem } from './publicCart.utils';

const storageKey = 'rainbow-slices-public-cart-v1';

interface PublicCartContextValue {
  items: PublicCartItem[];
  isOpen: boolean;
  totalItems: number;
  addProduct: (product: PublicCartProduct) => AddToCartResult;
  incrementItem: (productId: string) => AddToCartResult;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const PublicCartContext = createContext<PublicCartContextValue | null>(null);

function readStoredCart() {
  if (typeof window === 'undefined') return [];

  try {
    const rawCart = window.localStorage.getItem(storageKey);
    if (!rawCart) return [];

    const parsedCart = JSON.parse(rawCart) as PublicCartItem[];
    return Array.isArray(parsedCart) ? parsedCart.filter((item) => item.productId && item.quantity > 0) : [];
  } catch (_error) {
    return [];
  }
}

interface PublicCartProviderProps {
  children: ReactNode;
}

export function PublicCartProvider({ children }: PublicCartProviderProps) {
  const [items, setItems] = useState<PublicCartItem[]>(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (_error) {
      // Cart persistence is a convenience; the in-memory cart should keep working.
    }
  }, [items]);

  const addProduct = useCallback((product: PublicCartProduct): AddToCartResult => {
    const nextItem = toCartItem(product);
    let result: AddToCartResult = 'added';

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.id);

      if (!existingItem) return [...currentItems, nextItem];

      const refreshedItem = { ...existingItem, ...nextItem, quantity: existingItem.quantity };
      const limit = getCartItemLimit(refreshedItem);

      if (existingItem.quantity >= limit) {
        result = 'max-stock';
        return currentItems.map((item) => (item.productId === product.id ? refreshedItem : item));
      }

      return currentItems.map((item) => (item.productId === product.id ? { ...refreshedItem, quantity: item.quantity + 1 } : item));
    });

    setIsOpen(true);
    return result;
  }, []);

  const incrementItem = useCallback((productId: string): AddToCartResult => {
    let result: AddToCartResult = 'added';

    setItems((currentItems) => currentItems.map((item) => {
      if (item.productId !== productId) return item;
      if (item.quantity >= getCartItemLimit(item)) {
        result = 'max-stock';
        return item;
      }

      return { ...item, quantity: item.quantity + 1 };
    }));

    return result;
  }, []);

  const decrementItem = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.flatMap((item) => {
      if (item.productId !== productId) return [item];
      if (item.quantity <= 1) return [];
      return [{ ...item, quantity: item.quantity - 1 }];
    }));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<PublicCartContextValue>(() => ({
    items,
    isOpen,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    addProduct,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    openCart,
    closeCart
  }), [addProduct, clearCart, closeCart, decrementItem, incrementItem, isOpen, items, openCart, removeItem]);

  return <PublicCartContext.Provider value={value}>{children}</PublicCartContext.Provider>;
}

export function usePublicCart() {
  const value = useContext(PublicCartContext);

  if (!value) {
    throw new Error('usePublicCart must be used inside PublicCartProvider');
  }

  return value;
}
