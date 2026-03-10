"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string; // unique key (product_id + options)
    productId: string;
    name: string;
    price: number;
    qty: number;
    options: { [key: string]: any }; // Flexible options (e.g., { "ระดับความเผ็ด": ["เผ็ดกลาง"], "note": "..." })
    imageUrl?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("tamjai_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("tamjai_cart", JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (newItem: CartItem) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === newItem.id);
            if (existing) {
                return prev.map(item =>
                    item.id === newItem.id ? { ...item, qty: item.qty + newItem.qty } : item
                );
            }
            return [...prev, newItem];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item => (item.id === id ? { ...item, qty } : item)));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
