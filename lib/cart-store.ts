import { create } from "zustand"; 
import { persist } from "zustand/middleware"; 
import { CartItem, CartState } from "@/types"; 

export const useCartStore = create<CartState>()( 
  persist( 
    (set, get) => ({ 
      items: [], 

      addItem: (newItem: CartItem) => { 
        const items = get().items; 
        const existing = items.find((i) => i.variantId === newItem.variantId); 

        if (existing) { 
          set({ 
            items: items.map((i) => 
              i.variantId === newItem.variantId 
                ? { ...i, quantity: i.quantity + newItem.quantity } 
                : i 
            ), 
          }); 
        } else { 
          set({ items: [...items, newItem] }); 
        } 
      }, 

      removeItem: (variantId: string) => { 
        set({ items: get().items.filter((i) => i.variantId !== variantId) }); 
      }, 

      updateQuantity: (variantId: string, quantity: number) => { 
        if (quantity <= 0) { 
          get().removeItem(variantId); 
          return; 
        } 
        set({ 
          items: get().items.map((i) => 
            i.variantId === variantId ? { ...i, quantity } : i 
          ), 
        }); 
      }, 

      clearCart: () => set({ items: [] }), 

      total: () => { 
        return get().items.reduce( 
          (sum, item) => sum + item.unitPrice * item.quantity, 
          0 
        ); 
      }, 
    }), 
    { 
      name: "moon-cart", 
    } 
  ) 
); 
