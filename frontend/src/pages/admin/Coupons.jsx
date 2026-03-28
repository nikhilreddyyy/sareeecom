import React, { useState } from 'react';
import { Plus, Trash2, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO = [
  { id: '1', code: 'SILK20', type: 'percent', value: 20, minOrder: 5000, expiry: '2026-06-30', active: true },
  { id: '2', code: 'FLAT500', type: 'flat', value: 500, minOrder: 3000, expiry: '2026-05-15', active: true },
];

const EMPTY = { code: '', type: 'percent', value: '', minOrder: '', expiry: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(DEMO);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (!form.value) return toast.error('Discount value is required');
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setCoupons((prev) => [...prev, { ...form, id: crypto.randomUUID(), active: true }]);
    toast.success('Coupon created!');
    setForm(EMPTY);
    setShowForm(false);
    setSaving(false);
  }

  function doDelete() {
    setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
    toast.success('Coupon deleted');
    setDeleteId(null);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      {/* Coupon cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 relative group">
            <button onClick={() => setDeleteId(c.id)}
              className="absolute top-3 right-3 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={15} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Tag size={16} /></div>
              <span className="font-mono font-bold text-lg tracking-widest text-gray-800">{c.code}</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mb-1">
              {c.type === 'percent' ? `${c.value}% off` : `₹${Number(c.value).toLocaleString('en-IN')} off`}
            </p>
            {c.minOrder && (
              <p className="text-xs text-gray-500">Min order: ₹{Number(c.minOrder).toLocaleString('en-IN')}</p>
            )}
            {c.expiry && (
              <p className="text-xs text-gray-400 mt-1">Expires: {new Date(c.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            )}
            <span className={`mt-3 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {c.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">No coupons yet.</div>
        )}
      </div>

      {/* Add Coupon modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input type="text" className="input uppercase" placeholder="e.g. SAVE20"
                  value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.type === 'percent' ? 'Discount %' : 'Amount (₹)'} *
                  </label>
                  <input type="number" className="input" placeholder="0" min="0"
                    max={form.type === 'percent' ? 100 : undefined}
                    value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
                  <input type="number" className="input" placeholder="0" min="0"
                    value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" className="input"
                    value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Create Coupon'}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Coupon?</h3>
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
