import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Share2, ArrowLeft, Check, Package, Truck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { productAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await productAPI.getOne(id);
        setProduct(data.product);
        if (data.product.color?.[0]) setSelectedColor(data.product.color[0]);
      } catch { toast.error('Product not found'); }
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    await addToCart(product._id, qty, selectedSize, selectedColor);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    await api.post(`/auth/wishlist/${product._id}`);
    toast.success('Wishlist updated');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await productAPI.addReview(product._id, reviewData);
      toast.success('Review submitted!');
      setShowReviewForm(false);
      const { data } = await productAPI.getOne(id);
      setProduct(data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const price = product.discountedPrice || product.price;
  const images = product.images?.length ? product.images : [{ url: 'https://placehold.co/600x750/f3e8ff/9333ea?text=Saree' }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className={`relative img-zoom-container bg-gray-100 rounded-2xl overflow-hidden aspect-[4/5] cursor-zoom-in`}
            onClick={() => setIsZoomed(!isZoomed)}>
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              src={images[activeImage]?.url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`}
            />
            {product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 badge bg-primary-600 text-white font-bold text-sm px-3 py-1.5">
                -{product.discountPercent}%
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary-500 shadow-lg' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-primary-600 font-medium text-sm uppercase tracking-wide mb-2">
            {product.category?.name} · {product.fabric}
          </p>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating value={product.rating} readonly />
            <span className="text-sm text-gray-600">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-primary-700">₹{price.toLocaleString('en-IN')}</span>
            {product.discountedPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="badge bg-green-100 text-green-700 font-bold">Save ₹{(product.price - product.discountedPrice).toLocaleString('en-IN')}</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.shortDescription || product.description?.substring(0, 200)}</p>

          {/* Color Selection */}
          {product.color?.length > 0 && (
            <div className="mb-5">
              <p className="font-semibold text-gray-800 text-sm mb-2">Color: <span className="text-primary-600">{selectedColor}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.color.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${selectedColor === c ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <div className="mb-5">
              <p className="font-semibold text-gray-800 text-sm mb-2">Size: <span className="text-primary-600">{selectedSize || 'Select'}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded-xl text-sm border-2 transition-all font-medium ${selectedSize === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="font-semibold text-gray-800 text-sm">Quantity:</p>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 font-semibold text-lg">-</button>
              <span className="w-12 text-center font-semibold text-sm">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 font-semibold text-lg">+</button>
            </div>
            <span className="text-sm text-gray-500">{product.stock} available</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-base py-4">
              <ShoppingCart size={20} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist} className="w-14 h-14 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all">
              <Heart size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Shipping' },
              { icon: Shield, label: 'Authentic' },
              { icon: Package, label: 'Easy Returns' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl text-center">
                <Icon size={18} className="text-primary-600 mb-1" />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 text-gray-600 text-xs px-3 py-1">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-14 border-t pt-10">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Product Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="mt-14 border-t pt-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Customer Reviews ({product.numReviews})
          </h2>
          {user && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="btn-outline text-sm py-2">Write a Review</button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="card p-6 mb-8 border-primary-100">
            <h3 className="font-semibold text-gray-900 mb-4">Write Your Review</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">Your Rating</p>
              <StarRating value={reviewData.rating} onChange={r => setReviewData(d => ({ ...d, rating: r }))} size={28} />
            </div>
            <textarea
              required value={reviewData.comment}
              onChange={e => setReviewData(d => ({ ...d, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              className="input h-28 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={submittingReview} className="btn-primary py-2.5">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn-outline py-2.5">Cancel</button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {product.reviews?.length > 0 ? (
          <div className="space-y-5">
            {product.reviews.map(review => (
              <div key={review._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StarRating value={review.rating} readonly size={14} />
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
