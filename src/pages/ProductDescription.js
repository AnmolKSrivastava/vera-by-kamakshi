import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDescription.css";
import { useProduct } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { formatPrice } from "../utils/formatters";
import { getDeliveryEstimate, addToRecentlyViewed } from "../utils/helpers";
import ImageGallery from "../components/product/ImageGallery";
import ProductTabs from "../components/product/ProductTabs";
import ReviewsSection from "../components/product/ReviewsSection";
import RelatedProducts from "../components/product/RelatedProducts";

const ProductDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, refetch } = useProduct(id);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Handle scroll for sticky add-to-cart bar
  useEffect(() => {
    const handleScroll = () => {
      const addToCartBtn = document.querySelector('.product-actions');
      if (addToCartBtn) {
        const rect = addToCartBtn.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    setAddedToCart(false);
  }, [id]);

  // Calculate stock status early for use in SEO metadata
  const stock = Number(product?.stock) || 0;
  const isLowStock = stock > 0 && stock <= 10;
  const isOutOfStock = stock === 0;

  // Memoize product images array to prevent unnecessary re-renders
  const productImages = useMemo(() => {
    if (!product) return [];
    return product.images || [product.image];
  }, [product]);

  // Update page title and meta tags for SEO
  useEffect(() => {
    if (product) {
      // Update page title
      document.title = `${product.name} - VERA by Kamakshi`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', 
        product.description || `Buy ${product.name} at VERA by Kamakshi. Premium handcrafted leather bags with free shipping.`
      );
      
      // Open Graph tags
      const updateOgTag = (property, content) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };
      
      updateOgTag('og:title', product.name);
      updateOgTag('og:description', product.description || `Premium ${product.name}`);
      updateOgTag('og:image', product.image);
      updateOgTag('og:url', window.location.href);
      updateOgTag('og:type', 'product');
      updateOgTag('og:price:amount', product.price);
      updateOgTag('og:price:currency', 'INR');
      
      // Twitter Card tags
      const updateTwitterTag = (name, content) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };
      
      updateTwitterTag('twitter:card', 'summary_large_image');
      updateTwitterTag('twitter:title', product.name);
      updateTwitterTag('twitter:description', product.description || `Premium ${product.name}`);
      updateTwitterTag('twitter:image', product.image);
      
      // Add structured data (JSON-LD)
      let structuredDataScript = document.querySelector('#product-structured-data');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'product-structured-data';
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      
      const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": productImages,
        "description": product.description || `Premium ${product.name} from VERA by Kamakshi`,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "VERA by Kamakshi"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "VERA by Kamakshi"
          }
        }
      };
      
      // Add optional fields if available
      if (product.sku) structuredData.sku = product.sku;
      if (product.material) structuredData.material = product.material;
      if (product.countryOfOrigin) {
        structuredData.countryOfOrigin = {
          "@type": "Country",
          "name": product.countryOfOrigin
        };
      }
      
      structuredDataScript.textContent = JSON.stringify(structuredData);
      
      // Track this product as recently viewed
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        stock: product.stock
      });
    }
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'VERA by Kamakshi';
    };
  }, [product, productImages, isOutOfStock]);

  if (loading) return <LoadingSpinner message="Loading product..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!product) return <ErrorMessage error="Product not found." />;

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      options: {
        ...(selectedColor && { color: selectedColor }),
        ...(selectedSize && { size: selectedSize })
      }
    };
    
    addToCart(cartItem);
    setAddedToCart(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  // Mock viewing count
  const viewingCount = Math.floor(Math.random() * 20) + 5;
  
  // Get delivery estimate
  const deliveryEstimate = getDeliveryEstimate(3, 5);

  return (
    <div className="product-description-page">
      <div className="product-desc-outer-container">
        {/* Image Gallery */}
        <div className="product-desc-image-section">
          <ImageGallery images={productImages} productName={product.name} />
        </div>
        
        {/* Product Details */}
        <div className="product-desc-details">
          {/* Wishlist Button */}
          <button 
            className={`wishlist-button ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist(product.id) ? '❤️' : '🤍'}
          </button>

          <h1 className="product-desc-title">{product.name}</h1>
          <div className="product-desc-price">{formatPrice(product.price)}</div>
          
          {/* Stock & Urgency Indicators */}
          <div className="product-indicators">
            {!isOutOfStock && (
              <span className={`stock-indicator ${isLowStock ? 'low' : 'available'}`}>
                {isLowStock ? `${stock === 1 ? 'Only 1 piece left' : `Only ${stock} pieces left`}` : 'Available for dispatch'}
              </span>
            )}
            {isOutOfStock && (
              <span className="stock-indicator out">Currently unavailable</span>
            )}
            <span className="viewing-count">⚡ {viewingCount} people viewing</span>
          </div>

          {/* Product Highlights */}
          <div className="product-highlights">
            <div className="highlight-item">✓ Genuine Leather</div>
            <div className="highlight-item">✓ Handcrafted in India</div>
            <div className="highlight-item">✓ 1 Year Warranty</div>
            <div className="highlight-item">✓ Free Shipping & Returns</div>
          </div>
          
          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="product-desc-colors-section">
              <label className="product-option-label">
                Color: {selectedColor && <span className="selected-value">Selected</span>}
              </label>
              <div className="product-desc-colors">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`color-dot ${selectedColor === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    title={color}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="product-size-section">
              <label className="product-option-label">
                Size: {selectedSize && <span className="selected-value">{selectedSize}</span>}
              </label>
              <div className="size-options">
                {product.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {product.dimensions && (
                <div className="dimensions-info">
                  📐 Dimensions: {product.dimensions}
                </div>
              )}
            </div>
          )}

          {/* Quantity Selection */}
          <div className="product-quantity-section">
            <label className="product-option-label">Quantity:</label>
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            <button 
              className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button 
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy Now
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="delivery-item">
              <span className="delivery-icon">🚚</span>
              <div className="delivery-details">
                <strong>Free Delivery</strong>
                <span>On orders over ₹500</span>
              </div>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">📦</span>
              <div className="delivery-details">
                <strong>Estimated Delivery</strong>
                <span>{deliveryEstimate.longRange}</span>
              </div>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">🔄</span>
              <div className="delivery-details">
                <strong>Easy Returns</strong>
                <span>7-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add-to-Cart Bar (Mobile) */}
      {showStickyBar && (
        <div className="sticky-cart-bar">
          <div className="sticky-cart-content">
            <img src={product.image} alt={product.name} className="sticky-product-image" />
            <div className="sticky-product-info">
              <span className="sticky-product-name">{product.name}</span>
              <span className="sticky-product-price">{formatPrice(product.price)}</span>
            </div>
            <button 
              className="sticky-add-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {addedToCart ? '✓' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}

      {/* Tabbed Product Information */}
      <div className="product-info-container">
        <ProductTabs product={product} />
      </div>

      {/* Customer Reviews */}
      <ReviewsSection productId={product.id} productName={product.name} />

      {/* Related Products */}
      <RelatedProducts 
        currentProductId={product.id} 
        category={product.category} 
        currentPrice={product.price}
      />
    </div>
  );
};

export default ProductDescription;
