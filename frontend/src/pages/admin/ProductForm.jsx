import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input type="text" className="input" placeholder="Enter product name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input type="number" className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input" rows={4} placeholder="Product description..." />
        </div>
        <div className="flex gap-3">
          <button className="btn-primary">Save Product</button>
          <button className="btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
