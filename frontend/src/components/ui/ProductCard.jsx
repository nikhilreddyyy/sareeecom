import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    await addToCart(product._id);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); return; }
    try {
      await api.post(`/auth/wishlist/${product._id}`);
      toast.success('Wishlist updated');
    } catch { toast.error('Error updating wishlist'); }
  };

  const mainImage = product.images?.[0]?.url || 'https://placehold.co/400x500/f3e8ff/9333ea?text=Saree';
  const hoverImage = product.images?.[1]?.url || mainImage;
  const discountPct = product.discountPercent || (product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/products/${product._id}`} className="product-card block">
        {/* Image container */}
        <div className="relative img-zoom-container aspect-[3/4] bg-gray-100">
          <img src={mainImage} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          {/* Hover image */}
          <img src={hoverImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct > 0 && (
              <span className="badge bg-primary-600 text-white font-bold">-{discountPct}%</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-gold-500 text-white">Featured</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-700 text-white">Sold Out</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
            <button onClick={handleWishlist} className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary-50 transition-colors">
              <Heart size={16} className="text-primary-600" />
            </button>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-50">
              <ShoppingCart size={16} className="text-primary-600" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
            {product.category?.name || product.fabric}
          </p>
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={11} className={s <= Math.round(product.rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="price-tag text-base">₹{(product.discountedPrice || product.price).toLocaleString('en-IN')}</span>
            {product.discountedPrice && <span className="price-old">₹{product.price.toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
