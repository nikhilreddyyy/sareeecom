import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const steps = ['Address', 'Review', 'Payment'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [placing, setPlacing] = useState(false);
  const { cart, pricing, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddr(def);
    }
  }, [user]);

  const getShippingAddress = () => selectedAddr || newAddr;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const addr = getShippingAddress();
      const { data } = await orderAPI.create({ shippingAddress: addr, paymentMethod });

      // Simulate payment for demo
      if (paymentMethod !== 'cod') {
        await orderAPI.pay(data.order._id, {
          paymentResult: { id: 'PAY-' + Date.now(), status: 'completed', updateTime: new Date().toISOString(), emailAddress: user.email }
        });
      }

      useCartStore.getState().clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setPlacing(false);
  };

  const items = cart?.items || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${i < step ? 'bg-primary-600 border-primary-600 text-white' : i === step ? 'border-primary-600 text-primary-600' : 'border-gray-300'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="font-medium text-sm hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Shipping Address</h2>

              {user?.addresses?.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-gray-700">Saved Addresses</p>
                  {user.addresses.map(addr => (
                    <label key={addr._id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${selectedAddr?._id === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="addr" checked={selectedAddr?._id === addr._id} onChange={() => setSelectedAddr(addr)} className="mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{addr.name}</p>
                        <p className="text-gray-600 text-sm">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-gray-500 text-sm">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {user?.addresses?.length > 0 ? 'Or enter a new address:' : 'Enter shipping address:'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', col: 'col-span-1' },
                    { key: 'phone', label: 'Phone Number', col: 'col-span-1' },
                    { key: 'street', label: 'Street Address', col: 'col-span-2' },
                    { key: 'city', label: 'City', col: 'col-span-1' },
                    { key: 'state', label: 'State', col: 'col-span-1' },
                    { key: 'pincode', label: 'Pincode', col: 'col-span-1' },
                  ].map(({ key, label, col }) => (
                    <div key={key} className={col}>
                      <label className="text-xs text-gray-600 mb-1 block">{label}</label>
                      <input value={newAddr[key]} onChange={e => { setNewAddr(a => ({ ...a, [key]: e.target.value })); setSelectedAddr(null); }}
                        placeholder={label} className="input text-sm py-2.5" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(1)} className="btn-primary mt-6 py-3 flex items-center gap-2">Continue to Review</button>
            </motion.div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Review Order</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <img src={item.product?.images?.[0]?.url || 'https://placehold.co/60x70'} alt="" className="w-14 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product?.name}</p>
                      <p className="text-gray-500 text-xs">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}</p>
                      <p className="text-primary-700 font-semibold text-sm mt-1">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-outline py-3">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary py-3 flex-1">Continue to Payment</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'stripe', label: 'Credit / Debit Card (Stripe)', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                  { value: 'razorpay', label: 'UPI / Razorpay', icon: Smartphone, desc: 'PhonePe, GPay, Paytm' },
                  { value: 'cod', label: 'Cash on Delivery', icon: Check, desc: 'Pay when delivered' },
                ].map(method => (
                  <label key={method.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${paymentMethod === method.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={e => setPaymentMethod(e.target.value)} />
                    <method.icon size={20} className="text-primary-600" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                      <p className="text-gray-500 text-xs">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline py-3">Back</button>
                <button onClick={placeOrder} disabled={placing} className="btn-primary py-3 flex-1 flex items-center justify-center gap-2">
                  {placing ? 'Placing Order...' : `Place Order · ₹${pricing?.total?.toFixed(2) || 0}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
          {pricing && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{pricing.subtotal.toLocaleString('en-IN')}</span></div>
              {pricing.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{pricing.discount.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{pricing.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={pricing.shipping === 0 ? 'text-green-600' : ''}>{pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping}`}</span></div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary-700">₹{pricing.total.toFixed(2)}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
