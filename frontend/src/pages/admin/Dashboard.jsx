import React from 'react';
import { Package, ShoppingCart, Users, Tag, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Products', value: '3', sub: '+1 this week', icon: Package, color: 'bg-purple-100 text-purple-600', link: '/admin/products' },
  { label: 'Total Orders', value: '0', sub: 'Connect backend', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600', link: '/admin/orders' },
  { label: 'Total Users', value: '0', sub: 'Connect backend', icon: Users, color: 'bg-green-100 text-green-600', link: '/admin/users' },
  { label: 'Active Coupons', value: '2', sub: 'SILK20, FLAT500', icon: Tag, color: 'bg-yellow-100 text-yellow-600', link: '/admin/coupons' },
];

const quickLinks = [
  { label: 'Add a new product', to: '/admin/products/new', desc: 'Upload photos, videos, set price & discount' },
  { label: 'Create a coupon', to: '/admin/coupons', desc: 'Offer discounts to your customers' },
  { label: 'Manage banners', to: '/admin/banners', desc: 'Update homepage promotional banners' },
  { label: 'View all orders', to: '/admin/orders', desc: 'Track and manage customer orders' },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((q) => (
            <Link key={q.to} to={q.to}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-purple-300 hover:shadow-sm transition-all group">
              <div>
                <p className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">{q.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{q.desc}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Admin info banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <p className="text-sm font-medium text-purple-800 mb-1">Backend not connected</p>
        <p className="text-sm text-purple-600">
          Add Firebase credentials to <code className="bg-purple-100 px-1 rounded">backend/.env</code> to enable live data,
          user management, order tracking, and real image uploads.
        </p>
      </div>
    </div>
  );
}
