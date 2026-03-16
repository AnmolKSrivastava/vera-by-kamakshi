// src/components/product/ProductTabs.js
import React, { useState } from 'react';
import './ProductTabs.css';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'materials', label: 'Materials' },
    { id: 'care', label: 'Care Instructions' },
    { id: 'shipping', label: 'Shipping & Returns' }
  ];

  return (
    <div className="product-tabs">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tabs-content">
        {activeTab === 'description' && (
          <div className="tab-panel">
            <p>{product.description || 'Premium handcrafted leather bag with attention to detail and quality craftsmanship. Perfect for everyday use or special occasions.'}</p>
            {product.features && (
              <ul className="feature-list">
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {activeTab === 'materials' && (
          <div className="tab-panel">
            <h4>Product Specifications</h4>
            <ul className="specifications-list">
              {product.material && (
                <li>
                  <strong>Material:</strong> {product.material}
                </li>
              )}
              {product.dimensions && (
                <li>
                  <strong>Dimensions:</strong> {product.dimensions}
                </li>
              )}
              {product.weight && (
                <li>
                  <strong>Weight:</strong> {product.weight}
                </li>
              )}
              {product.countryOfOrigin && (
                <li>
                  <strong>Country of Origin:</strong> {product.countryOfOrigin}
                </li>
              )}
              {!product.material && !product.dimensions && !product.weight && !product.countryOfOrigin && (
                <>
                  <li><strong>Material:</strong> Full-grain genuine leather</li>
                  <li><strong>Dimensions:</strong> 30cm x 25cm x 10cm (approx.)</li>
                  <li><strong>Weight:</strong> 650g</li>
                  <li><strong>Country of Origin:</strong> India</li>
                </>
              )}
            </ul>
            
            <h4 className="materials-subtitle">Premium Construction</h4>
            <ul>
              <li><strong>Lining:</strong> {product.lining || 'Premium cotton canvas'}</li>
              <li><strong>Hardware:</strong> {product.hardware || 'Brass fittings with gold finish'}</li>
              <li><strong>Stitching:</strong> {product.stitching || 'Hand-stitched with reinforced seams'}</li>
            </ul>
            <p className="craftsmanship-note">
              ✨ Each piece is handcrafted by skilled artisans in India, ensuring unique character and superior quality.
            </p>
          </div>
        )}
        
        {activeTab === 'care' && (
          <div className="tab-panel">
            <h4>How to Care for Your Bag</h4>
            <div className="care-instructions">
              <div className="care-item">
                <span className="care-icon">🧼</span>
                <div>
                  <strong>Cleaning:</strong>
                  <p>Wipe with a soft, damp cloth. Use leather conditioner every 3-6 months.</p>
                </div>
              </div>
              <div className="care-item">
                <span className="care-icon">☀️</span>
                <div>
                  <strong>Storage:</strong>
                  <p>Store in a cool, dry place away from direct sunlight. Use dust bag when not in use.</p>
                </div>
              </div>
              <div className="care-item">
                <span className="care-icon">💧</span>
                <div>
                  <strong>Water Resistance:</strong>
                  <p>Avoid exposure to rain or water. If wet, pat dry immediately and air dry naturally.</p>
                </div>
              </div>
              <div className="care-item">
                <span className="care-icon">⚠️</span>
                <div>
                  <strong>Avoid:</strong>
                  <p>Harsh chemicals, excessive heat, sharp objects, and overloading the bag.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <div className="tab-panel">
            <h4>Shipping Information</h4>
            <ul>
              <li><strong>Free Shipping:</strong> On all orders across India</li>
              <li><strong>Delivery Time:</strong> 3-5 business days</li>
              <li><strong>Express Shipping:</strong> Available at checkout (1-2 days)</li>
              <li><strong>Tracking:</strong> Provided via email once shipped</li>
            </ul>
            
            <h4>Returns & Exchanges</h4>
            <ul>
              <li><strong>Return Window:</strong> 7 days from delivery</li>
              <li><strong>Condition:</strong> Item must be unused with original tags</li>
              <li><strong>Refund:</strong> Processed within 5-7 business days</li>
              <li><strong>Exchange:</strong> Available for size/color changes (subject to availability)</li>
            </ul>
            
            <p className="policy-note">
              📦 All items are carefully packed and quality-checked before shipping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
