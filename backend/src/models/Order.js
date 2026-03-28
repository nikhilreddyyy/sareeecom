const { getDb, serverTimestamp, generateOrderNumber } = require('../config/firebase');

const COLLECTION = 'orders';

const OrderModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  async findById(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async create(data) {
    const now = serverTimestamp();
    const orderData = {
      orderNumber: generateOrderNumber(),
      user: data.user,
      items: data.items,
      shippingAddress: data.shippingAddress,
      itemsPrice: data.itemsPrice,
      taxPrice: data.taxPrice,
      shippingPrice: data.shippingPrice,
      discountAmount: data.discountAmount || 0,
      coupon: data.coupon || null,
      totalPrice: data.totalPrice,
      paymentMethod: data.paymentMethod,
      paymentResult: data.paymentResult || null,
      isPaid: false,
      paidAt: null,
      orderStatus: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed' }],
      deliveredAt: null,
      trackingNumber: null,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(orderData);
    const created = await ref.get();
    return { id: created.id, ...created.data() };
  },

  async update(id, data) {
    const updateData = { ...data, updatedAt: serverTimestamp() };
    await this.collection().doc(id).update(updateData);
    return this.findById(id);
  },

  async getByUser(userId, { page = 1, limit = 10 } = {}) {
    const snap = await this.collection()
      .where('user', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const total = orders.length;
    const start = (page - 1) * limit;
    return { orders: orders.slice(start, start + limit), total };
  },

  async getAll({ page = 1, limit = 20, status = '' } = {}) {
    let query = this.collection().orderBy('createdAt', 'desc');
    if (status) query = query.where('orderStatus', '==', status);
    const snap = await query.get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const total = orders.length;
    const start = (page - 1) * limit;
    return { orders: orders.slice(start, start + limit), total };
  },

  async getAnalytics() {
    const snap = await this.collection().get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const byStatus = {};
    orders.forEach((o) => {
      byStatus[o.orderStatus] = (byStatus[o.orderStatus] || 0) + 1;
    });

    // Monthly revenue (last 6 months)
    const monthlyMap = {};
    orders
      .filter((o) => o.isPaid && o.createdAt)
      .forEach((o) => {
        const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + o.totalPrice;
      });

    const monthlyRevenue = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({ month, revenue }));

    // Top products by sold count
    const productMap = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        if (!productMap[item.product]) {
          productMap[item.product] = { name: item.name, image: item.image, count: 0 };
        }
        productMap[item.product].count += item.quantity;
      });
    });
    const topProducts = Object.entries(productMap)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalOrders, totalRevenue, byStatus, monthlyRevenue, topProducts };
  },
};

module.exports = OrderModel;
