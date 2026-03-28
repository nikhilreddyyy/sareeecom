import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, Check } from 'lucide-react';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const steps = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const stepMap = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4 };

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOne(id).then(({ data }) => { setOrder(data.order); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const currentStep = stepMap[order.orderStatus] ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
        <span className={`badge text-sm px-4 py-1.5 ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
        </span>
      </div>

      {/* Progress tracker */}
      {!['cancelled', 'refunded'].includes(order.orderStatus) && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                    ${i <= currentStep ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}>
                    {i <= currentStep ? <Check size={16} className="text-white" /> : <span className="text-gray-400 text-xs font-semibold">{i + 1}</span>}
                  </div>
                  <p className={`text-xs font-medium hidden sm:block ${i <= currentStep ? 'text-primary-700' : 'text-gray-400'}`}>{s}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <img src={item.image || 'https://placehold.co/60x70'} alt={item.name} className="w-14 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}</p>
                    <p className="text-primary-700 font-semibold text-sm mt-1">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} /> Shipping Address</h2>
            <p className="font-medium text-gray-800">{order.shippingAddress.name}</p>
            <p className="text-gray-600 text-sm">{order.shippingAddress.street}</p>
            <p className="text-gray-600 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-gray-600 text-sm">📞 {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.itemsPrice.toLocaleString('en-IN')}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discountAmount.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.taxPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary-700">₹{order.totalPrice.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><CreditCard size={16} /> Payment</h2>
            <p className="text-sm text-gray-600">{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</p>
            <p className={`text-sm font-semibold mt-1 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.isPaid ? '✓ Paid' : '⏳ Pending'}
            </p>
          </div>

          {order.trackingNumber && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Package size={16} /> Tracking</h2>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
