import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO = [
  { id: '1', name: 'Banarasi Silk Saree', category: 'Silk', price: 12000, discountPercent: 15, stock: 8, photos: 3 },
  { id: '2', name: 'Kanjeevaram Cotton Saree', category: 'Cotton', price: 4500, discountPercent: 0, stock: 20, photos: 5 },
  { id: '3', name: 'Designer Georgette Saree', category: 'Designer', price: 8900, discountPercent: 20, stock: 3, photos: 4 },
];

export default function AdminProducts() {
  const [products, setProducts] = useState(DEMO);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  function doDelete() {
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    toast.success('Product deleted');
    setDeleteId(null);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" className="input pl-9" placeholder="Search products..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Discount</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No products found.{' '}
                  <Link to="/admin/products/new" className="text-purple-600 underline">Add one</Link>
                </td>
              </tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.category}</td>
                <td className="px-4 py-3 text-right text-gray-700">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  {p.discountPercent > 0
                    ? <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{p.discountPercent}% off</span>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 hidden sm:table-cell">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/products/${p.id}/edit`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => setDeleteId(p.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={doDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Delete
              </button>
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
