import React, { useState } from 'react';
import { Search, MapPin, User, Wheat, Droplet, Leaf, Moon, Fish, Star, Clock, ChevronDown, Settings, LogOut, Heart, ShoppingBag } from 'lucide-react';

import './RestaurantPage.css';

const RestaurantPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dados mockados do restaurante
  const restaurant = {
    name: "Green Garden",
    logo: "https://via.placeholder.com/80x80/4ade80/ffffff?text=GG",
    coverImage: "https://via.placeholder.com/1200x400/10b981/ffffff?text=Restaurant+Cover",
    rating: 4.8,
    address: "Rua das Flores, 123 - Centro",
    certifications: ["Orgânico", "Vegano", "Sustentável"]
  };

  const productCategories = [
    {
      id: 'pratos-principais',
      name: 'Pratos Principais',
      products: [
        { id: 1, name: 'Risotto de Cogumelos', price: 'R$ 32,90', image: 'https://via.placeholder.com/200x150/22c55e/ffffff?text=Risotto', description: 'Risotto cremoso com cogumelos frescos' },
        { id: 2, name: 'Hambúrguer Vegano', price: 'R$ 28,50', image: 'https://via.placeholder.com/200x150/22c55e/ffffff?text=Burger', description: 'Hambúrguer artesanal 100% vegetal' },
        { id: 3, name: 'Salada Caesar', price: 'R$ 24,90', image: 'https://via.placeholder.com/200x150/22c55e/ffffff?text=Salad', description: 'Salada caesar com molho especial' },
        { id: 4, name: 'Pasta Pesto', price: 'R$ 26,90', image: 'https://via.placeholder.com/200x150/22c55e/ffffff?text=Pasta', description: 'Massa artesanal com pesto de manjericão' },
        { id: 5, name: 'Quinoa Bowl', price: 'R$ 29,90', image: 'https://via.placeholder.com/200x150/22c55e/ffffff?text=Bowl', description: 'Bowl nutritivo com quinoa e vegetais' }
      ]
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      products: [
        { id: 6, name: 'Suco Verde', price: 'R$ 12,90', image: 'https://via.placeholder.com/200x150/10b981/ffffff?text=Juice', description: 'Suco detox com couve e maçã' },
        { id: 7, name: 'Kombucha', price: 'R$ 15,90', image: 'https://via.placeholder.com/200x150/10b981/ffffff?text=Kombucha', description: 'Kombucha artesanal sabor gengibre' },
        { id: 8, name: 'Água de Coco', price: 'R$ 8,90', image: 'https://via.placeholder.com/200x150/10b981/ffffff?text=Coconut', description: 'Água de coco natural' },
        { id: 9, name: 'Smoothie', price: 'R$ 16,90', image: 'https://via.placeholder.com/200x150/10b981/ffffff?text=Smoothie', description: 'Smoothie de frutas vermelhas' }
      ]
    },
    {
      id: 'sobremesas',
      name: 'Sobremesas',
      products: [
        { id: 10, name: 'Brownie Vegano', price: 'R$ 18,90', image: 'https://via.placeholder.com/200x150/059669/ffffff?text=Brownie', description: 'Brownie sem glúten e vegano' },
        { id: 11, name: 'Mousse de Açaí', price: 'R$ 16,90', image: 'https://via.placeholder.com/200x150/059669/ffffff?text=Mousse', description: 'Mousse cremoso de açaí orgânico' },
        { id: 12, name: 'Pudim de Chia', price: 'R$ 14,90', image: 'https://via.placeholder.com/200x150/059669/ffffff?text=Pudding', description: 'Pudim nutritivo de chia com frutas' }
      ]
    }
  ];

  const scrollContainer = (containerId, direction) => {
    const container = document.getElementById(containerId);
    const scrollAmount = 250;
    const scrollLeft = direction === 'left' ? 
      container.scrollLeft - scrollAmount : 
      container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="restaurant-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="location-section">
            <MapPin size={20} />
            <span>Your Location</span>
          </div>
          <h1 className="logo">Food for All</h1>
          <div style={{ position: 'relative' }} className="user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#374151',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              <User size={18} />
              <span>John Doe</span>
              <ChevronDown size={16} />
            </button>
            
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  minWidth: '200px',
                  zIndex: 1000
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>John Doe</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>john.doe@email.com</div>
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <ShoppingBag size={16} />
                    <span>My Orders</span>
                  </button>
                  
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Heart size={16} />
                    <span>Favorites</span>
                  </button>
                  
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>
                
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 0' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#dc2626',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Restaurant Cover */}
      <div className="restaurant-cover">
        <img src={restaurant.coverImage} alt="Restaurant Cover" className="cover-image" />
        <div className="cover-overlay">
          <div className="restaurant-info">
            <img src={restaurant.logo} alt="Restaurant Logo" className="restaurant-logo" />
            <div className="restaurant-details">
              <h2 className="restaurant-name">{restaurant.name}</h2>
              <div className="restaurant-meta">
                <span className="rating">⭐ {restaurant.rating}</span>
                <span className="address">{restaurant.address}</span>
              </div>
              <div className="certifications">
                {restaurant.certifications.map((cert, index) => (
                  <span key={index} className="certification-badge">{cert}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {productCategories.map((category) => (
          <section key={category.id} className="product-section">
            <div className="section-header">
              <h3 className="section-title">{category.name}</h3>
              <div className="scroll-controls">
                <button 
                  className="scroll-btn scroll-left"
                  onClick={() => scrollContainer(category.id, 'left')}
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button 
                  className="scroll-btn scroll-right"
                  onClick={() => scrollContainer(category.id, 'right')}
                  aria-label="Scroll right"
                >
                  →
                </button>
              </div>
            </div>
            
            <div className="products-container" id={category.id}>
              {category.products.map((product) => (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">{product.price}</span>
                      <button className="add-to-cart-btn">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default RestaurantPage;