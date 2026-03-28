import React from 'react';
import { Plus } from 'lucide-react';

export default function AdminCoupons() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Coupon
        </button>
      </div>
      <div className="card p-6 text-center text-gray-500">
        No coupons yet. Connect the backend API to manage coupons.
      </div>
    </div>
  );
}
