const { getDb, serverTimestamp } = require('../config/firebase');

const COLLECTION = 'coupons';

const CouponModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  async findById(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findByCode(code) {
    const snap = await this.collection()
      .where('code', '==', code.toUpperCase().trim())
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  isValid(coupon) {
    const now = new Date();
    const validFrom = coupon.validFrom?.toDate ? coupon.validFrom.toDate() : new Date(coupon.validFrom);
    const validUntil = coupon.validUntil?.toDate ? coupon.validUntil.toDate() : new Date(coupon.validUntil);
    if (!coupon.isActive) return { valid: false, message: 'Coupon is inactive' };
    if (now < validFrom) return { valid: false, message: 'Coupon is not yet active' };
    if (now > validUntil) return { valid: false, message: 'Coupon has expired' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return { valid: false, message: 'Coupon usage limit reached' };
    return { valid: true };
  },

  async getAll() {
    const snap = await this.collection().orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async create(data) {
    const now = serverTimestamp();
    const couponData = {
      code: data.code.toUpperCase().trim(),
      description: data.description || '',
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscountAmount: data.maxDiscountAmount || null,
      usageLimit: data.usageLimit || null,
      usedCount: 0,
      userUsageLimit: data.userUsageLimit || 1,
      usedBy: [],
      validFrom: data.validFrom || new Date().toISOString(),
      validUntil: data.validUntil,
      isActive: data.isActive !== undefined ? data.isActive : true,
      applicableCategories: data.applicableCategories || [],
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(couponData);
    const created = await ref.get();
    return { id: created.id, ...created.data() };
  },

  async update(id, data) {
    const updateData = { ...data, updatedAt: serverTimestamp() };
    await this.collection().doc(id).update(updateData);
    return this.findById(id);
  },

  async delete(id) {
    await this.collection().doc(id).delete();
  },
};

module.exports = CouponModel;
