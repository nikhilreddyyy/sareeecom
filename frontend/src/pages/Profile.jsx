import React, { useState } from 'react';
import { User, MapPin, Lock, Save, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/addresses', newAddr);
      updateUser({ addresses: data.addresses });
      toast.success('Address added!');
      setShowAddrForm(false);
      setNewAddr({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/auth/addresses/${id}`);
      updateUser({ addresses: data.addresses });
      toast.success('Address removed');
    } catch { toast.error('Error'); }
  };

  const tabs = [{ id: 'profile', icon: User, label: 'Profile' }, { id: 'addresses', icon: MapPin, label: 'Addresses' }, { id: 'password', icon: Lock, label: 'Password' }];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Account</h1>

      {/* Avatar & info */}
      <div className="flex items-center gap-5 mb-8 p-6 bg-gradient-to-r from-primary-50 to-gold-50 rounded-2xl">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-700">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-600">{user?.email}</p>
          {user?.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-8">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 -mb-px
              ${tab === id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <form onSubmit={saveProfile} className="card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input value={user?.email} disabled className="input bg-gray-50 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Addresses tab */}
      {tab === 'addresses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {user?.addresses?.map(addr => (
            <div key={addr._id} className="card p-5 flex items-start gap-4">
              <MapPin size={18} className="text-primary-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{addr.name} {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 text-xs ml-2">Default</span>}</p>
                <p className="text-gray-600 text-sm">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-gray-500 text-sm">{addr.phone}</p>
              </div>
              <button onClick={() => deleteAddress(addr._id)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {showAddrForm ? (
            <form onSubmit={addAddress} className="card p-6">
              <h3 className="font-semibold mb-4">New Address</h3>
              <div className="grid grid-cols-2 gap-4">
                {[['name', 'Full Name'], ['phone', 'Phone'], ['street', 'Street'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([k, l]) => (
                  <div key={k} className={k === 'street' ? 'col-span-2' : ''}>
                    <label className="text-xs text-gray-600 mb-1 block">{l}</label>
                    <input value={newAddr[k]} onChange={e => setNewAddr(a => ({ ...a, [k]: e.target.value }))} className="input text-sm py-2.5" required />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary py-2.5">Save Address</button>
                <button type="button" onClick={() => setShowAddrForm(false)} className="btn-outline py-2.5">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddrForm(true)} className="flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
              <Plus size={18} /> Add New Address
            </button>
          )}
        </motion.div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <form onSubmit={changePassword} className="card p-6 space-y-4 max-w-md">
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([k, l]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input type="password" required value={passForm[k]} onChange={e => setPassForm(f => ({ ...f, [k]: e.target.value }))} className="input" />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Lock size={16} /> {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
