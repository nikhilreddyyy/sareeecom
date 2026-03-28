import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function AdminProducts() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>
      <div className="card p-6 text-center text-gray-500">
        No products yet. Connect the backend API to manage products.
      </div>
    </div>
  );
}
