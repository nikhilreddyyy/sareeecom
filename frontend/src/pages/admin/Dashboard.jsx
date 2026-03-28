import React from 'react';
import { Package, ShoppingCart, Users, Tag } from 'lucide-react';

const stats = [
  { label: 'Total Products', value: '—', icon: Package, color: 'bg-purple-100 text-purple-600' },
  { label: 'Total Orders', value: '—', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  { label: 'Total Users', value: '—', icon: Users, color: 'bg-green-100 text-green-600' },
  { label: 'Active Coupons', value: '—', icon: Tag, color: 'bg-yellow-100 text-yellow-600' },
];

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
