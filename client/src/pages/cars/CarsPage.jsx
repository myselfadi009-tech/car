import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiTrendingUp } from 'react-icons/fi';
import { fetchCars } from '../../redux/slices/carSlice.js';
import CarCard from '../../components/cards/CarCard.jsx';
import './cars.css';

const BRANDS = ['All', 'Lamborghini', 'Ferrari', 'Porsche', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Range Rover'];
const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['All', 'Auto', 'Manual'];
const CATEGORIES = ['All', 'Luxury', 'Sports', 'SUV', 'Sedan', 'Electric', 'Convertible'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function CarsPage() {
  const dispatch = useDispatch();
  const { cars, total, pages, loading } = useSelector(s => s.cars);
  const [filters, setFilters] = useState({ brand: '', fuelType: '', transmission: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1, search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('grid');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allCars, setAllCars] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params[k] = v; });
    dispatch(fetchCars(params));
  }, [filters, dispatch]);

  useEffect(() => {
    if (allCars.length === 0 && cars.length > 0) setAllCars(cars);
    if (cars.length > 0 && !filters.search) setAllCars(prev => [...new Map([...prev, ...cars].map(c => [c._id, c])).values()]);
  }, [cars]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    setShowSuggestions(val.length > 0);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: val, page: 1 }));
    }, 300);
  };

  const suggestions = searchInput.length > 0
    ? allCars.filter(c =>
        c.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
        c.brand?.toLowerCase().includes(searchInput.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 6)
    : [];

  const pickSuggestion = (car) => {
    setSearchInput(car.name);
    setShowSuggestions(false);
    setFilters(prev => ({ ...prev, search: car.name, page: 1 }));
  };

  const clearSearch = () => {
    setSearchInput('');
    setShowSuggestions(false);
    setFilters(prev => ({ ...prev, search: '', page: 1 }));
  };

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
  const clearFilters = () => {
    setFilters({ brand: '', fuelType: '', transmission: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1, search: '' });
    setSearchInput('');
  };

  return (
    <div className="cars-page">
      <div className="cars-hero">
        <div className="cars-hero-glow" />
        <div className="container-custom" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="badge-orange" style={{ marginBottom: 12 }}>🚗 Our Fleet</div>
            <h1 className="section-title">Premium Car <span className="orange-text">Collection</span></h1>
            <p className="section-subtitle" style={{ marginTop: 12 }}>Choose from our wide range of luxury cars</p>
          </motion.div>

          {/* ── Realtime Search with Suggestions ── */}
          <motion.div
            className="search-bar-wrap"
            ref={searchRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="search-bar">
              <FiSearch size={20} />
              <input
                type="text"
                placeholder="Search by name, brand, or category..."
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => searchInput.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {searchInput && (
                <button onClick={clearSearch} className="search-clear-btn">
                  <FiX size={16} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  className="search-suggestions"
                  initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{ transformOrigin: 'top' }}
                >
                  <div className="ss-header">
                    <FiTrendingUp size={12} /> Suggestions
                  </div>
                  {suggestions.map((car) => (
                    <div
                      key={car._id}
                      className="ss-item"
                      onClick={() => pickSuggestion(car)}
                    >
                      <img
                        src={car.images?.[0]}
                        alt={car.name}
                        className="ss-thumb"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="ss-info">
                        <span className="ss-name">{car.name}</span>
                        <span className="ss-meta">{car.brand} · {car.category}</span>
                      </div>
                      <span className="ss-price">₹{car.price?.toLocaleString()}/day</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="container-custom cars-body">
        <div className="cars-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter size={16} /> Filters
            </button>
            <span className="results-count">{total} cars found</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="sort-select" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><FiGrid /></button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><FiList /></button>
            </div>
          </div>
        </div>

        {showFilters && (
          <motion.div className="filters-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Brand</label>
                <select value={filters.brand} onChange={e => updateFilter('brand', e.target.value)}>
                  {BRANDS.map(b => <option key={b} value={b === 'All' ? '' : b}>{b}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Category</label>
                <select value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Fuel Type</label>
                <select value={filters.fuelType} onChange={e => updateFilter('fuelType', e.target.value)}>
                  {FUEL_TYPES.map(f => <option key={f} value={f === 'All' ? '' : f}>{f}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Transmission</label>
                <select value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)}>
                  {TRANSMISSIONS.map(t => <option key={t} value={t === 'All' ? '' : t}>{t}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Min Price (₹/day)</label>
                <input type="number" placeholder="0" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Max Price (₹/day)</label>
                <input type="number" placeholder="100000" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>
            <button className="btn-outline-orange" onClick={clearFilters} style={{ fontSize: '13px', padding: '8px 20px' }}>
              <FiX /> Clear Filters
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className={`cars-grid-container ${view}`}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)}
          </div>
        ) : cars.length === 0 ? (
          <div className="no-cars">
            <p style={{ fontSize: 40 }}>🚫</p>
            <h3>No cars found</h3>
            <p>Try adjusting your filters or search term</p>
            <button className="btn-orange" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className={`cars-grid-container ${view}`}>
            {cars.map((car, i) => <CarCard key={car._id} car={car} index={i} />)}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            {[...Array(pages)].map((_, i) => (
              <button key={i} className={`page-btn ${filters.page === i + 1 ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
