import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Image, Video, Tag, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    originalPrice: '',
    discountPercent: '',
    description: '',
    category: '',
    fabric: '',
    color: '',
    stock: '',
  });

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [saving, setSaving] = useState(false);

  const photoRef = useRef();
  const videoRef = useRef();

  const finalPrice =
    form.originalPrice && form.discountPercent
      ? (form.originalPrice * (1 - form.discountPercent / 100)).toFixed(2)
      : form.originalPrice || '';

  function handlePhotos(e) {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), caption: '' })),
    ]);
    e.target.value = '';
  }

  function removePhoto(pid) {
    setPhotos((prev) => { const p = prev.find((x) => x.id === pid); if (p) URL.revokeObjectURL(p.preview); return prev.filter((x) => x.id !== pid); });
  }

  function handleVideos(e) {
    const files = Array.from(e.target.files);
    setVideos((prev) => [
      ...prev,
      ...files.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), description: '' })),
    ]);
    e.target.value = '';
  }

  function removeVideo(vid) {
    setVideos((prev) => { const v = prev.find((x) => x.id === vid); if (v) URL.revokeObjectURL(v.preview); return prev.filter((x) => x.id !== vid); });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.originalPrice) return toast.error('Price is required');
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    } catch { toast.error('Failed to save product'); }
    finally { setSaving(false); }
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} className="input" placeholder={placeholder}
        value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input type="text" className="input" placeholder="e.g. Banarasi Silk Saree"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            {field('Category', 'category', 'text', 'e.g. Silk, Cotton, Designer')}
            {field('Fabric', 'fabric', 'text', 'e.g. Pure Silk, Georgette')}
            {field('Color', 'color', 'text', 'e.g. Red, Blue, Multi')}
            {field('Stock Quantity', 'stock', 'number', '0')}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input" rows={4}
                placeholder="Describe the saree — weave, occasion, care instructions..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Pricing & Discount */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Tag size={18} /> Pricing &amp; Discount</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) *</label>
              <input type="number" className="input" placeholder="0.00" min="0" step="0.01"
                value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Percent size={14} /> Discount (%)
              </label>
              <input type="number" className="input" placeholder="0" min="0" max="100"
                value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Price (₹)</label>
              <div className="input bg-gray-50 text-gray-700 font-semibold">
                {finalPrice ? `₹${Number(finalPrice).toLocaleString('en-IN')}` : '—'}
              </div>
            </div>
          </div>
          {form.discountPercent > 0 && form.originalPrice && (
            <p className="text-sm text-green-600 font-medium">
              Customer saves ₹{(form.originalPrice - finalPrice).toFixed(2)} ({form.discountPercent}% off)
            </p>
          )}
        </section>

        {/* Photos */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Image size={18} /> Product Photos</h2>
          <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
          <button type="button" onClick={() => photoRef.current.click()}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors w-full justify-center">
            <Upload size={18} /> Click to upload photos (JPG, PNG, WebP)
          </button>
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden group">
                  <div className="relative">
                    <img src={photo.preview} alt="" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-2">
                    <input type="text"
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-purple-400"
                      placeholder="Add caption..."
                      value={photo.caption}
                      onChange={(e) => setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, caption: e.target.value } : p))} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Videos */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Video size={18} /> Product Videos</h2>
          <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideos} />
          <button type="button" onClick={() => videoRef.current.click()}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors w-full justify-center">
            <Upload size={18} /> Click to upload videos (MP4, MOV, WebM)
          </button>
          {videos.length > 0 && (
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden group">
                  <div className="relative">
                    <video src={video.preview} controls className="w-full max-h-56 bg-black" />
                    <button type="button" onClick={() => removeVideo(video.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Description</label>
                    <textarea rows={2}
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-purple-400 resize-none"
                      placeholder="Describe what this video shows..."
                      value={video.description}
                      onChange={(e) => setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, description: e.target.value } : v))} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate('/admin/products')} disabled={saving}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
