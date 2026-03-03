export type OrderStatus = 
  | "pending" 
  | "paid" 
  | "processing" 
  | "shipped" 
  | "delivered" 
  | "cancelled"; 

export type PaymentStatus = "pending" | "pending_confirmation" | "paid" | "failed"; 

export type PaymentMethod = "mercadopago" | "transfer" | "cash"; 

export interface CartItem { 
  variantId: string; 
  productId: string; 
  productName: string; 
  variantSize: string; 
  variantColor: string; 
  imageUrl: string; 
  unitPrice: number; 
  quantity: number; 
} 

export interface CartState { 
  items: CartItem[]; 
  addItem: (item: CartItem) => void; 
  removeItem: (variantId: string) => void; 
  updateQuantity: (variantId: string, quantity: number) => void; 
  clearCart: () => void; 
  total: () => number; 
}
