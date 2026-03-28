import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['Silk Sarees', 'Cotton Sarees', 'Designer Sarees', 'Lehengas', 'Fabric Dresses'];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white text-xs py-1.5 text-center">
        <span className="flex items-center justify-center gap-2">
          <Sparkles size={12} />
          Free shipping on orders above ₹1000 | Use code WELCOME10 for 10% off
          <Sparkles size={12} />
        </span>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-serif text-2xl font-bold text-primary-800">Vastralaya</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Home</Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Collections <ChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map(cat => (
                  <Link key={cat} to={`/products?search=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">All Products</Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-primary-50 rounded-lg transition-colors">
              <Search size={20} className="text-gray-600" />
            </button>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="p-2 hover:bg-primary-50 rounded-lg transition-colors">
                <Heart size={20} className="text-gray-600" />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-primary-50 rounded-lg transition-colors">
              <ShoppingCart size={20} className="text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-primary-50 rounded-lg transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50">Admin Panel</Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 btn-primary py-2 px-4 text-sm">
                <User size={15} /> Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for sarees, fabrics, styles..."
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary py-2 px-5">Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <Link to="/" className="block text-gray-700 py-2 font-medium">Home</Link>
            <Link to="/products" className="block text-gray-700 py-2 font-medium">All Products</Link>
            {categories.map(cat => (
              <Link key={cat} to={`/products?search=${encodeURIComponent(cat)}`} className="block text-gray-500 py-1.5 pl-4">
                {cat}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="block text-gray-700 py-2 font-medium">My Profile</Link>
                <Link to="/orders" className="block text-gray-700 py-2 font-medium">My Orders</Link>
                {user.role === 'admin' && <Link to="/admin" className="block text-primary-600 py-2 font-medium">Admin Panel</Link>}
                <button onClick={logout} className="block text-red-600 py-2 font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary inline-block text-center">Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
