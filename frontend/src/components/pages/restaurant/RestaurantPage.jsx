import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, MapPin, User, Wheat, Droplet, Leaf, Moon, Fish, Star, Clock, ChevronDown, Settings, LogOut, Heart, ShoppingBag, Loader } from 'lucide-react';

import './RestaurantPage.css';

const RestaurantPage = () => {
  const { id } = useParams(); // Obtém o ID do restaurante da URL
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCategories, setProductCategories] = useState([]);

  // Função para buscar os dados do restaurante
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        // Faz a requisição para a API
        const response = await fetch(`https://render-test-iezh.onrender.com/api/restaurant/${id || 1}`);
        
        if (!response.ok) {
          throw new Error(`An error occured trying to fetch the restaurant: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'An error occured trying to fetch the restaurant');
        }
        
        console.log("API Response:", data); // Log para debug
        
        // Formata os dados do restaurante com base na resposta real da API
        const restaurantData = {
          id: data.data.id,
          name: data.data.name,
          logo: data.data.logo || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&h=80&fit=crop&crop=faces&auto=format&q=80`,
          coverImage: data.data.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop&auto=format&q=80",
          rating: data.data.rating || 4.5,
          address: data.data.address,
          stellarPublicKey: data.data.stellar_public_key,
          // Adaptação para lidar com o formato real das certificações
          certifications: Array.isArray(data.data.certifications) ? data.data.certifications : []
        };
        
        setRestaurant(restaurantData);
        
        // Mantém os dados mockados para os produtos
        setProductCategories([
          {
            id: 'main-dishes',
            name: 'Main Dishes',
            products: [
              { id: 1, name: 'Mushroom Risotto', price: 'XLM 16,45', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=150&fit=crop&auto=format&q=80', description: 'Risotto cremoso com cogumelos frescos' },
              { id: 2, name: 'Vegan Hamburguer', price: 'XLM 14,25', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=200&h=150&fit=crop&auto=format&q=80', description: 'Hambúrguer artesanal 100% vegetal' },
              { id: 3, name: 'Caesar Salad', price: 'XLM 12,45', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=150&fit=crop&auto=format&q=80', description: 'Salada caesar com molho especial' },
              { id: 4, name: 'Pasta Pesto', price: 'XLM 13,45', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&h=150&fit=crop&auto=format&q=80', description: 'Massa artesanal com pesto de manjericão' },
              { id: 5, name: 'Quinoa Bowl', price: 'XLM 14,95', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=200&h=150&fit=crop&auto=format&q=80', description: 'Bowl nutritivo com quinoa e vegetais' }
            ]
          },
          {
            id: 'drinks',
            name: 'drinks',
            products: [
              { id: 6, name: 'Green Juice', price: 'XLM 6,45', image: 'https://images.unsplash.com/photo-1622597467836-f3e6707e1696?w=200&h=150&fit=crop&auto=format&q=80', description: 'Suco detox com couve e maçã' },
              { id: 7, name: 'Kombucha', price: 'XLM 7,95', image: 'https://images.unsplash.com/photo-1595864585991-0ad021961d13?w=200&h=150&fit=crop&auto=format&q=80', description: 'Kombucha artesanal sabor gengibre' },
              { id: 8, name: 'Coconut Water', price: 'XLM 4,45', image: 'https://images.unsplash.com/photo-1546470427-30ab5df789bd?w=200&h=150&fit=crop&auto=format&q=80', description: 'Água de coco natural' },
              { id: 9, name: 'Smoothie', price: 'XLM 8,45', image: 'https://images.unsplash.com/photo-1553530666-ba11a90bb437?w=200&h=150&fit=crop&auto=format&q=80', description: 'Smoothie de frutas vermelhas' }
            ]
          },
          {
            id: 'desserts',
            name: 'desserts',
            products: [
              { id: 10, name: 'Vegan Brownie ', price: 'XLM 8,45', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=150&fit=crop&auto=format&q=80', description: 'Brownie sem glúten e vegano' },
              { id: 11, name: 'Cheesecake', price: 'XLM 8,45', image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=200&h=150&fit=crop&auto=format&q=80', description: 'Mousse cremoso de açaí orgânico' },
              { id: 12, name: 'Ice Cream', price: 'XLM 7,95', image: 'https://images.unsplash.com/photo-1621236378699-8597faf6a11a?w=200&h=150&fit=crop&auto=format&q=80', description: 'Pudim nutritivo de chia com frutas' }
            ]
          }
        ]);
        
      } catch (err) {
        console.error('An error occured trying to find the restaurant:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

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

  // Renderiza um estado de carregamento
  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <Loader size={40} className="animate-spin" color="#22c55e" />
        <p>Loading restaurant's information...</p>
      </div>
    );
  }

  // Renderiza um estado de erro
  if (error) {
    return (
      <div className="error-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '0 2rem',
        textAlign: 'center'
      }}>
        <div style={{ color: '#dc2626', fontSize: '2rem' }}>⚠️</div>
        <h2>Erro ao carregar o restaurante</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  // Se não tiver dados do restaurante
  if (!restaurant) {
    return (
      <div className="error-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Restaurant not found</h2>
        <p>It was not possible to find information on this restaurant.</p>
      </div>
    );
  }

  // Função para mapear os códigos de certificação para nomes mais amigáveis
  const getCertificationName = (cert) => {
    // Adaptado para lidar com diferentes formatos de certificação
    const code = typeof cert === 'string' ? cert : (cert.asset_code || cert.code || '');
    
    const certMap = {
      'VEGAN': 'Vegan',
      'GLUTEN_FREE': 'Gluten-Free',
      'SEAFOOD_FREE': 'No Seafood',
      'KOSHER': 'Kosher',
      'HALAL': 'Halal',
      'ORGANIC': 'Organic',
      'SUSTAINABLE': 'Sustainable',
    };
    
    return certMap[code] || code;
  };

  return (
    <div className="restaurant-page">
      {/* Header */}
      <header className="header">
        <div className="header-content" style={{ padding: '0 2rem' }}>
          <div className="location-section">
            <MapPin size={20} />
            <span>Your Location</span>
          </div>
          <div className="logo-container">
            <img 
              src="/safebite.png" 
              alt="SafeBite Logo" 
              className="safebite-logo"
              style={{ 
                height: '40px',
                objectFit: 'contain'
              }}
            />
          </div>
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
        <div className="cover-overlay" style={{ padding: '3rem 2rem 2rem' }}>
          <div className="restaurant-info">
            <img src={restaurant.logo} alt="Restaurant Logo" className="restaurant-logo" />
            <div className="restaurant-details">
              <h2 className="restaurant-name">{restaurant.name}</h2>
              <div className="restaurant-meta">
                <span className="rating">⭐ {restaurant.rating}</span>
                <span className="address">{restaurant.address}</span>
              </div>
              {restaurant.certifications && restaurant.certifications.length > 0 ? (
                <div className="certifications">
                  {restaurant.certifications.map((cert, index) => (
                    <span key={index} className="certification-badge">
                      {getCertificationName(cert)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="certifications">
                  <span 
                    className="no-certifications"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      fontSize: '0.8rem'
                    }}
                  >
                    No certifications available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content" style={{ padding: '2rem' }}>
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