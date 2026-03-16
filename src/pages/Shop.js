import React, { useState, useMemo, useEffect } from "react";
import "./Shop.css";
import ProductTile from "../components/product/ProductTile";
import { useProducts } from "../hooks/useProducts";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const Shop = () => {
  const { products, loading, error, refetch } = useProducts();
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  const itemsPerPage = 12;

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Get unique colors from products
  const colors = useMemo(() => {
    const cols = new Set();
    products.forEach(p => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach(c => cols.add(c));
      }
    });
    return Array.from(cols);
  }, [products]);

  // Get price range from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 1000) * 1000;
  }, [products]);

  // Update price range max when products load
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => 
        p.colors && p.colors.some(c => selectedColors.includes(c))
      );
    }

    // Apply stock filter
    if (showInStockOnly) {
      filtered = filtered.filter(p => (p.stock || 0) > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming products have a createdAt field or using reverse order
        filtered.reverse();
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Keep original order or sort by featured flag
        filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, priceRange, selectedCategories, selectedColors, showInStockOnly, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, selectedCategories, selectedColors, showInStockOnly, sortBy]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleClearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setShowInStockOnly(false);
    setSortBy('featured');
  };

  const activeFiltersCount = 
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedColors.length > 0 ? 1 : 0) +
    (showInStockOnly ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0);

  if (loading) return <LoadingSpinner message="Loading products..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div className="shop-outer-container">
      <h1 className="shop-title">SHOP</h1>
      <div className="shop-title-underline"></div>
      
      <div className="shop-layout">
        {/* Filter Toggle Button (Mobile) */}
        <button 
          className="filter-toggle-btn"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          🔍 Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${filtersVisible ? 'visible' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            {activeFiltersCount > 0 && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear All
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range-values">
              ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </div>
            <div className="price-range-inputs">
              <input
                type="range"
                min="0"
                max={maxPrice}
                step="500"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="price-slider"
              />
              <input
                type="range"
                min="0"
                max={maxPrice}
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="price-slider"
              />
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="filter-section">
              <h4>Category</h4>
              <div className="filter-options">
                {categories.map(category => (
                  <label key={category} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {colors.length > 0 && (
            <div className="filter-section">
              <h4>Color</h4>
              <div className="color-filter-options">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-filter-dot ${selectedColors.includes(color) ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorToggle(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stock Filter */}
          <div className="filter-section">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products Section */}
        <div className="products-section">
          {/* Sort and Results Bar */}
          <div className="shop-controls">
            <div className="results-count">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Product' : 'Products'}
            </div>
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {paginatedProducts.length === 0 ? (
              <div className="no-products-message">
                <p>No products match your filters.</p>
                <button onClick={handleClearFilters} className="clear-filters-link">
                  Clear all filters
                </button>
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <ProductTile key={product.id} {...product} product={product} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
