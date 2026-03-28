const { getDb, serverTimestamp, generateSlug } = require('../config/firebase');

const COLLECTION = 'products';

const ProductModel = {
  collection() {
    return getDb().collection(COLLECTION);
  },

  _calcDiscount(data) {
    if (data.discountedPrice && data.price > 0) {
      data.discountPercent = Math.round(
        ((data.price - data.discountedPrice) / data.price) * 100
      );
    }
    return data;
  },

  _calcRating(reviews = []) {
    if (!reviews.length) return { rating: 0, numReviews: 0 };
    const rating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    return { rating, numReviews: reviews.length };
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

  async create(data) {
    if (!data.slug) data.slug = generateSlug(data.name);
    data = this._calcDiscount(data);
    const now = serverTimestamp();
    const productData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription || '',
      price: data.price,
      discountedPrice: data.discountedPrice || null,
      discountPercent: data.discountPercent || 0,
      images: data.images || [],
      videos: data.videos || [],
      category: data.category,
      tags: data.tags || [],
      fabric: data.fabric,
      color: data.color || [],
      sizes: data.sizes || [],
      stock: data.stock || 0,
      sku: data.sku || null,
      weight: data.weight || null,
      isFeatured: data.isFeatured || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      reviews: [],
      numReviews: 0,
      rating: 0,
      soldCount: 0,
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(productData);
    const created = await ref.get();
    return { id: created.id, ...created.data() };
  },

  async update(id, data) {
    if (data.discountedPrice !== undefined || data.price !== undefined) {
      const existing = await this.findById(id);
      const price = data.price || existing.price;
      const discountedPrice = data.discountedPrice !== undefined ? data.discountedPrice : existing.discountedPrice;
      if (discountedPrice && price > 0) {
        data.discountPercent = Math.round(((price - discountedPrice) / price) * 100);
      }
    }
    const updateData = { ...data, updatedAt: serverTimestamp() };
    await this.collection().doc(id).update(updateData);
    return this.findById(id);
  },

  async addReview(productId, review) {
    const product = await this.findById(productId);
    if (!product) return null;
    const reviews = [...(product.reviews || []), { ...review, createdAt: new Date().toISOString() }];
    const { rating, numReviews } = this._calcRating(reviews);
    await this.collection().doc(productId).update({
      reviews,
      rating,
      numReviews,
      updatedAt: serverTimestamp(),
    });
    return this.findById(productId);
  },

  async delete(id) {
    await this.collection().doc(id).delete();
  },

  async getAll({ filters = {}, search = '', sort = '-createdAt', page = 1, limit = 12, adminMode = false } = {}) {
    let query = this.collection();
    if (!adminMode) query = query.where('isActive', '==', true);
    if (filters.category) query = query.where('category', '==', filters.category);
    if (filters.isFeatured !== undefined) query = query.where('isFeatured', '==', filters.isFeatured);
    if (filters.fabric) query = query.where('fabric', '==', filters.fabric);

    const snap = await query.get();
    let products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Client-side filters Firestore can't do natively
    if (filters.minPrice !== undefined) products = products.filter((p) => p.price >= filters.minPrice);
    if (filters.maxPrice !== undefined) products = products.filter((p) => p.price <= filters.maxPrice);
    if (filters.color) products = products.filter((p) => p.color?.includes(filters.color));
    if (filters.size) products = products.filter((p) => p.sizes?.includes(filters.size));

    if (search) {
      const s = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }

    // Sort
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? -1 : 1;
    products.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });

    const total = products.length;
    const start = (page - 1) * limit;
    return { products: products.slice(start, start + limit), total, page, pages: Math.ceil(total / limit) };
  },

  async getFeatured(limit = 8) {
    const snap = await this.collection()
      .where('isFeatured', '==', true)
      .where('isActive', '==', true)
      .limit(limit)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getFilterOptions() {
    const snap = await this.collection().where('isActive', '==', true).get();
    const products = snap.docs.map((d) => d.data());
    const fabrics = [...new Set(products.map((p) => p.fabric).filter(Boolean))];
    const colors = [...new Set(products.flatMap((p) => p.color || []))];
    const sizes = [...new Set(products.flatMap((p) => p.sizes || []))];
    const prices = products.map((p) => p.price);
    return {
      fabrics,
      colors,
      sizes,
      priceRange: { min: Math.min(...prices) || 0, max: Math.max(...prices) || 0 },
    };
  },
};

module.exports = ProductModel;
