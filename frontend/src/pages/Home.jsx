import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';
import { productAPI, bannerAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const features = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders above ₹1000' },
  { icon: Shield, label: 'Secure Payment', desc: '100% secure checkout' },
  { icon: RefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, label: '24/7 Support', desc: 'Dedicated customer care' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [fp, cats, bans] = await Promise.all([
          productAPI.getFeatured(),
          categoryAPI.getAll(),
          bannerAPI.getAll({ position: 'hero' }),
        ]);
        setFeatured(fp.data.products);
        setCategories(cats.data.categories.slice(0, 6));
        setBanners(bans.data.banners);
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  const heroGradients = [
    'from-primary-950 via-primary-800 to-gold-800',
    'from-gray-900 via-primary-900 to-primary-700',
    'from-gold-900 via-primary-900 to-gray-900',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative min-h-[85vh] bg-gradient-to-br ${heroGradients[currentBanner % heroGradients.length]} flex items-center overflow-hidden transition-all duration-1000`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-400 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium mb-4">
              <Star size={14} className="fill-gold-400" /> Premium Collection 2026
            </span>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Timeless <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">Elegance</span>
              <br />in Every Thread
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Discover our exquisite collection of handcrafted sarees and fabric dresses. Where tradition meets modern style.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/products" className="btn-gold flex items-center gap-2 text-base">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?isFeatured=true" className="border-2 border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-colors font-semibold">
                View Featured
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { bg: 'bg-primary-200', text: 'Silk\nSarees', emoji: '✨' },
                  { bg: 'bg-gold-100', text: 'Bridal\nCollection', emoji: '👑' },
                  { bg: 'bg-pink-100', text: 'Designer\nDresses', emoji: '🌸' },
                  { bg: 'bg-purple-100', text: 'Cotton\nSarees', emoji: '🌿' },
                ].map(({ bg, text, emoji }, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`${bg} rounded-2xl p-6 flex flex-col items-center justify-center aspect-square cursor-pointer hover:scale-105 transition-transform shadow-lg`}>
                    <span className="text-4xl mb-2">{emoji}</span>
                    <span className="text-center font-semibold text-gray-800 text-sm whitespace-pre-line">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-500">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/products?category=${cat._id}`}
                  className="group flex flex-col items-center p-4 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🥻</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-primary-700">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-1">Featured Collection</h2>
              <p className="text-gray-500">Handpicked for you</p>
            </div>
            <Link to="/products?isFeatured=true" className="flex items-center gap-1 text-primary-600 font-medium hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-6xl mb-4">🛍️</p>
              <p>No featured products yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-gold-400 blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="badge bg-white/20 text-white mb-4 text-sm px-4 py-1.5">Limited Time Offer</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Up to 50% Off</h2>
            <p className="text-primary-200 text-lg mb-8">On select sarees and fabric dresses. Use code <span className="text-gold-300 font-bold">SAREE50</span></p>
            <Link to="/products" className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4">
              Shop the Sale <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
