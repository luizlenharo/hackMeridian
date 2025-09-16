import React, { useState } from 'react';
import { Search, MapPin, User, Wheat, Droplet, Leaf, Moon, Fish, Star, Clock, ChevronDown, Settings, LogOut, Heart, ShoppingBag } from 'lucide-react';
import './UserHomePage.css'; // CSS file needs to be created separately

const UserHomePage = () => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dietaryPreferences = [
    { id: 'gluten-free', label: 'Gluten-Free', icon: <Wheat size={20} /> },
    { id: 'lactose-free', label: 'Lactose-Free', icon: <Droplet size={20} /> },
    { id: 'vegan', label: 'Vegan', icon: <Leaf size={20} /> },
    { id: 'halal', label: 'Halal', icon: <Moon size={20} /> },
    { id: 'no-seafood', label: 'No Seafood', icon: <Fish size={20} /> },
    { id: 'kosher', label: 'Kosher', icon: <Star size={20} /> }
  ];

  const restaurants = [
    {
      id: 1,
      name: 'Green Garden Bistro',
      description: 'Fresh, organic ingredients with extensive vegan and gluten-free options. Farm-to-table experience.',
      rating: 4.8,
      deliveryTime: '25min',
      badges: ['vegan', 'gluten-free', 'organic'],
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      name: 'Mediterranean Delight',
      description: 'Authentic Mediterranean cuisine with fresh ingredients and healthy options.',
      rating: 4.6,
      deliveryTime: '30min',
      badges: ['halal', 'no-seafood'],
      image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      name: 'Kosher Kitchen',
      description: 'Traditional kosher meals prepared with care and attention to dietary laws.',
      rating: 4.7,
      deliveryTime: '35min',
      badges: ['kosher', 'lactose-free'],
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop'
    }
  ];

  const togglePreference = (prefId) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPreferences = selectedPreferences.length === 0 || 
                              selectedPreferences.some(pref => restaurant.badges.includes(pref));
    
    return matchesSearch && matchesPreferences;
  });

  return (
    <div className="food-delivery-container" onClick={(e) => {
      // Close user menu when clicking outside
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    }}>
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

      {/* Main Content */}
      <main className="main">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-icon">
            <Search size={20} />
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search restaurants or dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dietary Preferences */}
        <div className="preferences-section">
          <h2 className="preferences-title">Choose your dietary preferences</h2>
          <div className="preferences-grid">
            {dietaryPreferences.map((pref) => {
              const isSelected = selectedPreferences.includes(pref.id);
              return (
                <button
                  key={pref.id}
                  onClick={() => togglePreference(pref.id)}
                  className={`preference-button ${isSelected ? 'active' : 'inactive'}`}
                >
                  <div className={`preference-icon ${isSelected ? 'active' : 'inactive'}`}>
                    {pref.icon}
                  </div>
                  <span>{pref.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Restaurant Section */}
        <div className="restaurants-section">
          <h2 className="restaurants-title">Perfect restaurants for you</h2>
          <p className="restaurants-subtitle">Curated based on popular dietary-friendly options</p>
          
          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <div className="restaurant-image-fallback">
                  <Leaf size={48} color="#16a34a" />
                  <div className="rating-badge">
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <span>{restaurant.rating}</span>
                  </div>
                </div>
                <div className="restaurant-content">
                  <div className="restaurant-header">
                    <h3 className="restaurant-name">{restaurant.name}</h3>
                    <div className="delivery-time">
                      <Clock size={16} />
                      {restaurant.deliveryTime}
                    </div>
                  </div>
                  <p className="restaurant-description">{restaurant.description}</p>
                  <div className="badges-container">
                    {restaurant.badges.map((badge) => {
                      const pref = dietaryPreferences.find(p => p.id === badge);
                      return (
                        <span key={badge} className="badge">
                          {pref?.icon && (
                            <span style={{ transform: 'scale(0.8)' }}>
                              {pref.icon}
                            </span>
                          )}
                          {pref?.label || badge}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredRestaurants.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={48} color="#9ca3af" />
              </div>
              <h3 className="empty-state-title">No restaurants found</h3>
              <p className="empty-state-text">Try adjusting your search or dietary preferences</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserHomePage;