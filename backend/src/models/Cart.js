const { getDb, serverTimestamp } = require('../config/firebase');

const COLLECTION = 'carts';

const CartModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  async findByUser(userId) {
    const snap = await this.collection().where('user', '==', userId).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async createForUser(userId) {
    const now = serverTimestamp();
    const cartData = { user: userId, items: [], coupon: null, createdAt: now, updatedAt: now };
    const ref = await this.collection().add(cartData);
    const created = await ref.get();
    return { id: created.id, ...created.data() };
  },

  async update(id, data) {
    const updateData = { ...data, updatedAt: serverTimestamp() };
    await this.collection().doc(id).update(updateData);
    const doc = await this.collection().doc(id).get();
    return { id: doc.id, ...doc.data() };
  },

  calcSubtotal(items = []) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
};

module.exports = CartModel;
