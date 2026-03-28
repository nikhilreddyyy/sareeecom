import React, { useState } from 'react';
import { Plus, Pencil, Trash2, KeyRound, X, ShieldCheck, ShieldOff, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAdminAccountsStore from '../../store/adminAccountsStore';
import useAuthStore from '../../store/authStore';

const EMPTY_FORM = { name: '', email: '', password: '' };

function PasswordInput({ value, onChange, placeholder = 'Password', required = false }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className="input pr-10"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={6}
      />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function AdminAccounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, toggleActive } = useAdminAccountsStore();
  const { user: currentUser } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [changePwdId, setChangePwdId] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  function openCreate() { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(acc) { setEditId(acc.id); setForm({ name: acc.name, email: acc.email, password: '' }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim()) return toast.error('Email is required');
    if (!editId && !form.password) return toast.error('Password is required for new accounts');
    if (form.password && form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setSaving(true);
    try {
      if (editId) {
        await updateAccount(editId, { name: form.name, email: form.email });
        toast.success('Account updated!');
      } else {
        await addAccount({ name: form.name, email: form.email, password: form.password });
        toast.success('Admin account created!');
      }
      closeForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally { setSaving(false); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!newPwd || newPwd.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await updateAccount(changePwdId, { password: newPwd });
      toast.success('Password changed!');
      setChangePwdId(null);
      setNewPwd('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    try {
      await deleteAccount(deleteId);
      toast.success('Account deleted');
    } catch (err) { toast.error(err.message || 'Failed to delete'); }
    finally { setDeleteId(null); }
  }

  async function handleToggle(id) {
    try {
      await toggleActive(id);
    } catch (err) { toast.error(err.message || 'Failed'); }
  }

  const canCreate = accounts.length < 10;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{accounts.length}/10 admin accounts used</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!canCreate}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus size={18} /> Add Admin
        </button>
      </div>

      {/* Slot progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{accounts.length} used</span><span>{10 - accounts.length} remaining</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all"
            style={{ width: `${(accounts.length / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc, i) => {
          const isMe = acc.id === currentUser?._id || acc.email === currentUser?.email;
          return (
            <div key={acc.id} className={`bg-white border rounded-xl p-5 relative ${acc.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
              {/* Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                    {acc.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{acc.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[140px]">{acc.email}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400 mt-1">#{i + 1}</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${acc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {acc.isActive ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                  {acc.isActive ? 'Active' : 'Inactive'}
                </span>
                {isMe && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">You</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => openEdit(acc)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => { setChangePwdId(acc.id); setNewPwd(''); }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <KeyRound size={12} /> Password
                </button>
                {!isMe && (
                  <>
                    <button onClick={() => handleToggle(acc.id)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-yellow-300 hover:text-yellow-600 transition-colors">
                      {acc.isActive ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                      {acc.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setDeleteId(acc.id)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-red-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            No admin accounts yet. Create one above.
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Admin' : 'New Admin Account'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" className="input" placeholder="e.g. Store Manager"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="input" placeholder="admin@vastralaya.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <PasswordInput required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Account'}
                </button>
                <button type="button" className="btn-outline" onClick={closeForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password modal */}
      {changePwdId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <button onClick={() => { setChangePwdId(null); setNewPwd(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <PasswordInput placeholder="Min 6 characters" value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Update Password'}
                </button>
                <button type="button" className="btn-outline"
                  onClick={() => { setChangePwdId(null); setNewPwd(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Admin Account?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone. The admin will immediately lose access.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete}
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
