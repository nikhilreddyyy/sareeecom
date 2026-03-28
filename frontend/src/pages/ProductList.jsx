import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [{ data: catData }, { data: filterData }] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getFilters(),
      ]);
      setCategories(catData.categories);
      setFilters(filterData);
      if (filterData.priceRange?.max) {
        setMaxPrice(filterData.priceRange.max);
        setPriceRange([filterData.priceRange.min || 0, filterData.priceRange.max]);
      }
    } catch {}
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch {}
    setLoading(false);
  }, [searchParams]);

  useEffect(() => { fetchFilterOptions(); }, []);
  useEffect(() => { fetchProducts(); }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => setSearchParams({ page: '1' });

  const activeFilters = [...searchParams.entries()].filter(([k]) => !['page', 'sort', 'limit'].includes(k));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            {searchParams.get('search') ? `Results for "${searchParams.get('search')}"` : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={searchParams.get('sort') || '-createdAt'}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input py-2 w-48"
          >
            <option value="-createdAt">Newest First</option>
            <option value="discountedPrice">Price: Low to High</option>
            <option value="-discountedPrice">Price: High to Low</option>
            <option value="-rating">Top Rated</option>
            <option value="-soldCount">Best Selling</option>
            <option value="-discountPercent">Biggest Discount</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm hover:border-primary-400 transition-colors">
            <SlidersHorizontal size={16} /> Filters
            {activeFilters.length > 0 && (
              <span className="badge bg-primary-600 text-white">{activeFilters.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {activeFilters.map(([key, val]) => (
            <span key={key} className="flex items-center gap-1 badge bg-primary-100 text-primary-700 text-xs px-3 py-1.5">
              {key}: {val}
              <button onClick={() => updateFilter(key, '')}><X size={12} /></button>
            </span>
          ))}
          <button onClick={clearAllFilters} className="text-xs text-red-500 hover:underline">Clear All</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <aside className="w-64 shrink-0 space-y-6">
            {/* Category */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!searchParams.get('category')} onChange={() => updateFilter('category', '')} />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                {categories.map(c => (
                  <label key={c._id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" value={c._id} checked={searchParams.get('category') === c._id} onChange={() => updateFilter('category', c._id)} />
                    <span className="text-sm text-gray-700">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fabric */}
            {filters.fabrics?.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Fabric</h3>
                <div className="space-y-2">
                  {filters.fabrics.map(f => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={searchParams.get('fabric') === f} onChange={e => updateFilter('fabric', e.target.checked ? f : '')} />
                      <span className="text-sm text-gray-700">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {filters.colors?.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.colors.map(c => (
                    <button key={c} onClick={() => updateFilter('color', searchParams.get('color') === c ? '' : c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${searchParams.get('color') === c ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                  <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
                </div>
                <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  onMouseUp={() => { updateFilter('price[lte]', priceRange[1]); }}
                  className="w-full accent-primary-600" />
                <button onClick={() => { updateFilter('price[gte]', priceRange[0]); updateFilter('price[lte]', priceRange[1]); }}
                  className="btn-primary py-2 text-sm w-full">Apply</button>
              </div>
            </div>

            {/* Discount */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Discount</h3>
              <div className="space-y-2">
                {[10, 20, 30, 50].map(d => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discount" checked={searchParams.get('discountPercent[gte]') === String(d)} onChange={() => updateFilter('discountPercent[gte]', d)} />
                    <span className="text-sm text-gray-700">{d}% or more</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => updateFilter('page', i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearAllFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
