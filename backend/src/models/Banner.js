const { getDb, serverTimestamp } = require('../config/firebase');

const COLLECTION = 'banners';

const BannerModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  async findById(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async getActive({ position } = {}) {
    let query = this.collection().where('isActive', '==', true).orderBy('sortOrder', 'asc');
    const snap = await query.get();
    let banners = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const now = new Date();
    banners = banners.filter((b) => {
      if (b.validFrom && new Date(b.validFrom) > now) return false;
      if (b.validUntil && new Date(b.validUntil) < now) return false;
      return true;
    });
    if (position) banners = banners.filter((b) => b.position === position);
    return banners;
  },

  async getAll() {
    const snap = await this.collection().orderBy('sortOrder', 'asc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async create(data) {
    const now = serverTimestamp();
    const bannerData = {
      title: data.title,
      subtitle: data.subtitle || '',
      image: data.image,
      video: data.video || '',
      link: data.link || '',
      linkText: data.linkText || '',
      position: data.position || 'hero',
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: data.sortOrder || 0,
      validFrom: data.validFrom || null,
      validUntil: data.validUntil || null,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(bannerData);
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

module.exports = BannerModel;
