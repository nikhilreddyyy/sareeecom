import React, { useState, useRef } from 'react';
import { Plus, Trash2, Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO = [
  { id: '1', title: 'New Arrivals', subtitle: 'Shop the latest silk sarees', link: '/products', preview: null, active: true },
  { id: '2', title: 'Sale — Up to 40% Off', subtitle: 'Limited time offer on select styles', link: '/products?discount=true', preview: null, active: true },
];

const EMPTY = { title: '', subtitle: '', link: '', preview: null, file: null };

export default function AdminBanners() {
  const [banners, setBanners] = useState(DEMO);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const imgRef = useRef();

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => { if (prev.preview) URL.revokeObjectURL(prev.preview); return { ...prev, file, preview }; });
    e.target.value = '';
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setBanners((prev) => [...prev, { ...form, id: crypto.randomUUID(), active: true }]);
    toast.success('Banner created!');
    if (form.preview) URL.revokeObjectURL(form.preview);
    setForm(EMPTY);
    setShowForm(false);
    setSaving(false);
  }

  function doDelete() {
    setBanners((prev) => prev.filter((b) => b.id !== deleteId));
    toast.success('Banner deleted');
    setDeleteId(null);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden group relative">
            {b.preview
              ? <img src={b.preview} alt="" className="w-full h-40 object-cover" />
              : (
                <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Image size={40} className="text-purple-300" />
                </div>
              )}
            <button onClick={() => setDeleteId(b.id)}
              className="absolute top-3 right-3 bg-white/90 border border-gray-200 p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={15} />
            </button>
            <div className="p-4">
              <p className="font-semibold text-gray-800">{b.title}</p>
              {b.subtitle && <p className="text-sm text-gray-500 mt-0.5">{b.subtitle}</p>}
              {b.link && <p className="text-xs text-purple-500 mt-1 truncate">{b.link}</p>}
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {b.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">No banners yet.</div>
        )}
      </div>

      {/* Add Banner modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Banner</h2>
              <button onClick={() => { if (form.preview) URL.revokeObjectURL(form.preview); setForm(EMPTY); setShowForm(false); }}
                className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Image upload */}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              {form.preview
                ? (
                  <div className="relative">
                    <img src={form.preview} alt="" className="w-full h-40 object-cover rounded-lg" />
                    <button type="button" onClick={() => { URL.revokeObjectURL(form.preview); setForm((p) => ({ ...p, preview: null, file: null })); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => imgRef.current.click()}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors w-full justify-center">
                    <Upload size={18} /> Upload banner image
                  </button>
                )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" className="input" placeholder="e.g. New Arrivals"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input type="text" className="input" placeholder="Short tagline..."
                  value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input type="text" className="input" placeholder="/products or external URL"
                  value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Create Banner'}
                </button>
                <button type="button" className="btn-outline"
                  onClick={() => { if (form.preview) URL.revokeObjectURL(form.preview); setForm(EMPTY); setShowForm(false); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Banner?</h3>
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
