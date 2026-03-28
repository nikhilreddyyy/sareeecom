const { getDb, serverTimestamp, generateSlug } = require('../config/firebase');

const COLLECTION = 'categories';

const CategoryModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  async findById(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findBySlug(slug) {
    const snap = await this.collection().where('slug', '==', slug).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async getAll({ activeOnly = false } = {}) {
    let query = this.collection().orderBy('sortOrder', 'asc');
    if (activeOnly) query = query.where('isActive', '==', true);
    const snap = await query.get();
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Populate parent name
    return Promise.all(
      categories.map(async (cat) => {
        if (cat.parent) {
          const parent = await this.findById(cat.parent);
          return { ...cat, parentDoc: parent };
        }
        return cat;
      })
    );
  },

  async create(data) {
    if (!data.slug) data.slug = generateSlug(data.name);
    const now = serverTimestamp();
    const catData = {
      name: data.name.trim(),
      slug: data.slug,
      description: data.description || '',
      image: data.image || '',
      parent: data.parent || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: data.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(catData);
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

module.exports = CategoryModel;
