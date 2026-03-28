import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  pricing: null,
  loading: false,
  itemCount: 0,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      set({ cart: data.cart, pricing: data.pricing, itemCount: data.cart.items.length });
    } catch {}
  },

  addToCart: async (productId, quantity = 1, size, color) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/cart', { productId, quantity, size, color });
      set({ cart: data.cart, pricing: data.pricing, itemCount: data.cart.items.length, loading: false });
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      set({ loading: false });
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      set({ cart: data.cart, pricing: data.pricing, itemCount: data.cart.items.length });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      set({ cart: data.cart, pricing: data.pricing, itemCount: data.cart.items.length });
      toast.success('Item removed');
    } catch {}
  },

  applyCoupon: async (code) => {
    try {
      const { data } = await api.post('/cart/coupon', { code });
      set({ cart: data.cart, pricing: data.pricing });
      toast.success(data.message || 'Coupon applied!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      return false;
    }
  },

  removeCoupon: async () => {
    try {
      const { data } = await api.delete('/cart/coupon');
      set({ cart: data.cart, pricing: data.pricing });
    } catch {}
  },

  clearCart: () => set({ cart: null, pricing: null, itemCount: 0 }),
}));

export default useCartStore;
