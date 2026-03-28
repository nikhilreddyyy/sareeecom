const bcrypt = require('bcryptjs');
const { getDb, serverTimestamp } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');
const generateToken = require('../utils/generateToken');

const COLLECTION = 'admin_accounts';
const MAX_ADMINS = 10;

function col() {
  return getDb().collection(COLLECTION);
}

// GET /api/admin/accounts
exports.getAdminAccounts = async (req, res, next) => {
  try {
    const snap = await col().orderBy('createdAt', 'asc').get();
    const accounts = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name,
        email: d.email,
        role: 'admin',
        isActive: d.isActive,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });
    res.json({ success: true, accounts });
  } catch (err) { next(err); }
};

// POST /api/admin/accounts  — create a new admin account
exports.createAdminAccount = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required', 400));
    }

    // Enforce max 10
    const countSnap = await col().get();
    if (countSnap.size >= MAX_ADMINS) {
      return next(new AppError('Maximum of 10 admin accounts reached', 400));
    }

    // Check duplicate email
    const existing = await col().where('email', '==', email.toLowerCase()).limit(1).get();
    if (!existing.empty) {
      return next(new AppError('An admin with this email already exists', 400));
    }

    const hashed = await bcrypt.hash(password, 12);
    const now = serverTimestamp();
    const ref = await col().add({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const created = await ref.get();
    const d = created.data();
    res.status(201).json({
      success: true,
      account: { id: created.id, name: d.name, email: d.email, role: 'admin', isActive: d.isActive },
    });
  } catch (err) { next(err); }
};

// PUT /api/admin/accounts/:id  — update name / email / password
exports.updateAdminAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const doc = await col().doc(id).get();
    if (!doc.exists) return next(new AppError('Admin account not found', 404));

    const updates = { updatedAt: serverTimestamp() };
    if (name) updates.name = name.trim();
    if (email) {
      const clash = await col().where('email', '==', email.toLowerCase()).limit(1).get();
      if (!clash.empty && clash.docs[0].id !== id) {
        return next(new AppError('Email already used by another admin', 400));
      }
      updates.email = email.toLowerCase().trim();
    }
    if (password) {
      if (password.length < 6) return next(new AppError('Password must be at least 6 characters', 400));
      updates.password = await bcrypt.hash(password, 12);
    }

    await col().doc(id).update(updates);
    const updated = await col().doc(id).get();
    const d = updated.data();
    res.json({
      success: true,
      account: { id: updated.id, name: d.name, email: d.email, role: 'admin', isActive: d.isActive },
    });
  } catch (err) { next(err); }
};

// DELETE /api/admin/accounts/:id
exports.deleteAdminAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === id) {
      return next(new AppError('You cannot delete your own account', 403));
    }

    const doc = await col().doc(id).get();
    if (!doc.exists) return next(new AppError('Admin account not found', 404));

    // Keep at least 1 admin
    const countSnap = await col().get();
    if (countSnap.size <= 1) {
      return next(new AppError('Cannot delete the last admin account', 400));
    }

    await col().doc(id).delete();
    res.json({ success: true, message: 'Admin account deleted' });
  } catch (err) { next(err); }
};

// POST /api/admin/accounts/:id/toggle-active
exports.toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) return next(new AppError('Cannot deactivate your own account', 403));

    const doc = await col().doc(id).get();
    if (!doc.exists) return next(new AppError('Admin account not found', 404));

    const newState = !doc.data().isActive;
    await col().doc(id).update({ isActive: newState, updatedAt: serverTimestamp() });
    res.json({ success: true, isActive: newState });
  } catch (err) { next(err); }
};

// Called by auth login — find admin by email and verify password
exports.findAdminByEmail = async (email) => {
  const snap = await col().where('email', '==', email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
};
