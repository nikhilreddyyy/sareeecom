import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (res.success) navigate('/');
  };

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={form[name]} onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(err => ({ ...err, [name]: '' })); }}
        placeholder={placeholder} className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join Vastralaya today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field name="name" label="Full Name" placeholder="Your name" />
          <Field name="email" label="Email Address" type="email" placeholder="you@example.com" />
          <Field name="phone" label="Phone Number (optional)" placeholder="+91 98765 43210" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(err => ({ ...err, password: '' })); }}
                placeholder="Min 6 characters" className={`input pr-11 ${errors.password ? 'border-red-400' : ''}`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input type="password" value={form.confirmPassword}
              onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(err => ({ ...err, confirmPassword: '' })); }}
              placeholder="Repeat password" className={`input ${errors.confirmPassword ? 'border-red-400' : ''}`} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
