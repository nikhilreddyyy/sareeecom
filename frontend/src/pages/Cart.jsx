import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Cart() {
  const { cart, pricing, loading, fetchCart, updateItem, removeItem, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCode);
    setApplyingCoupon(false);
    setCouponCode('');
  };

  if (loading && !cart) return <LoadingSpinner fullScreen />;

  const items = cart?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some beautiful sarees to get started</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="card p-4 flex gap-4">
                  <Link to={`/products/${item.product?._id}`}>
                    <div className="w-24 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100x120'} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?._id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm">{item.product?.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.size && `Size: ${item.size}`}
                      {item.color && ` · Color: ${item.color}`}
                    </p>
                    <p className="font-bold text-primary-700 mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateItem(item._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={16} className="text-primary-600" /> Apply Coupon
              </h3>
              {cart?.coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                  <div>
                    <p className="text-green-700 font-semibold text-sm">{cart.coupon.code}</p>
                    <p className="text-green-600 text-xs">Coupon applied!</p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code" className="input flex-1 py-2.5 text-sm uppercase" />
                  <button type="submit" disabled={applyingCoupon} className="btn-primary py-2.5 px-4 text-sm">
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              {pricing && (
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{pricing.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (5% GST)</span>
                    <span>₹{pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={pricing.shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping}`}
                    </span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-700">₹{pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 py-3.5 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-primary-600 mt-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
