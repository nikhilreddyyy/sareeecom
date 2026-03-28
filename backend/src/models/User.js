const bcrypt = require('bcryptjs');
const { getDb, serverTimestamp } = require('../config/firebase');

const COLLECTION = 'users';

const UserModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  async findById(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findByIdWithPassword(id) {
    return this.findById(id);
  },

  async findByEmail(email) {
    const snap = await this.collection().where('email', '==', email.toLowerCase()).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const now = serverTimestamp();
    const userData = {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: data.phone || '',
      avatar: data.avatar || '',
      role: data.role || 'user',
      isBlocked: false,
      addresses: [],
      wishlist: [],
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(userData);
    const created = await ref.get();
    return { id: created.id, ...created.data() };
  },

  async update(id, data) {
    const updateData = { ...data, updatedAt: serverTimestamp() };
    await this.collection().doc(id).update(updateData);
    return this.findById(id);
  },

  async matchPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async getAll({ page = 1, limit = 20, search = '' } = {}) {
    let query = this.collection().orderBy('createdAt', 'desc');
    const snap = await query.get();
    let users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (search) {
      const s = search.toLowerCase();
      users = users.filter(
        (u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
      );
    }
    const total = users.length;
    const start = (page - 1) * limit;
    return { users: users.slice(start, start + limit), total };
  },
};

module.exports = UserModel;
