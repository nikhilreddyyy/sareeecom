import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-serif text-2xl font-bold text-white">Vastralaya</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Discover the finest collection of traditional and designer sarees & fabric dresses. Handcrafted with love.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                ['Home', '/'],
                ['All Products', '/products'],
                ['Silk Sarees', '/products?search=Silk Sarees'],
                ['Cotton Sarees', '/products?search=Cotton'],
                ['Designer Sarees', '/products?search=Designer'],
                ['New Arrivals', '/products?sort=-createdAt'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {['My Account', 'Order History', 'Track Order', 'Returns & Refunds', 'Shipping Policy', 'Privacy Policy', 'Terms & Conditions'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <span>123 Textile Market, Surat, Gujarat 395001</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Mail size={16} className="text-primary-400 shrink-0" />
                <span>support@vastralaya.com</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-5">
              <p className="text-sm font-medium text-white mb-2">Subscribe for offers</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500" />
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Vastralaya. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={12} className="text-primary-400" />
            <span>Secure payments via Stripe & Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
