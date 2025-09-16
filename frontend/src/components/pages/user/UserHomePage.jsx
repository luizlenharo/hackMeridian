import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, User, Wheat, Droplet, Leaf, Moon, Fish, Star,  ChevronDown, Settings, LogOut, Heart, ShoppingBag } from 'lucide-react';
import './UserHomePage.css'; // CSS file needs to be created separately
import logoImage from '../../../assets/images/safebite-logo.jpg';

const API_URL = 'https://render-test-iezh.onrender.com/api/restaurant';

const UserHomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // O useEffect é executado quando o componente é montado
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Chama o endpoint /list da sua API
        const response = await fetch(`${API_URL}/list`);
        if (!response.ok) {
          throw new Error('Falha ao buscar os dados da API');
        }
        const data = await response.json();
        setRestaurants(data.items); // A API retorna os restaurantes dentro da chave 'items'
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);



// Substitua o seu array por este:

const dietaryPreferences = [
    { 
        id: 'vegan', 
        label: 'Vegan', 
        backendCode: 'VEGAN', 
        icon: <Leaf size={20} /> 
    },
    { 
        id: 'gluten-free', 
        label: 'Gluten-Free',
        backendCode: 'GLUTENFREE',
        icon: <Wheat size={20} />
    },
    { 
        id: 'no-seafood', 
        label: 'No Seafood',
        backendCode: 'SEAFOODFREE',
        icon: <Fish size={20} />  
    },
    { 
        id: 'kosher', 
        label: 'Kosher',
        backendCode: 'KOSHER',
        icon: <Star size={20} />
    },
    { 
        id: 'halal', 
        label: 'Halal',
        backendCode: 'HALAL',
        icon: <Moon size={20} />
    },
    {
        id: 'lactose-free',
        label: 'Lactose-Free',
        backendCode: 'LACTOSEFREE', // Assumindo o código do backend
        icon: <Droplet size={20} />
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
    // Filtro de busca por texto (nome e endereço)
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por preferências (certificações)
    const matchesPreferences = selectedPreferences.length === 0 ||
      selectedPreferences.every(prefId => {
        const prefObject = dietaryPreferences.find(p => p.id === prefId);
        if (!prefObject) return false;
        // Verifica se alguma certificação do restaurante corresponde ao código da preferência
        return restaurant.certifications.some(cert => cert.asset_code.toUpperCase() === prefObject.apiCode);
      });

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
            <div className="logo-container">
              <img src={logoImage} alt="Logo da SafeBite" className="brand-logo" />
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
                  <Link
                    to="/user-home/profile" // <-- O destino da navegação
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
                      textAlign: 'left',
                      textDecoration: 'none' // <-- Remove o sublinhado do link
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  
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
          <h2 className="restaurants-title">Restaurants for you</h2>
          <p className="restaurants-subtitle">Find options based on your preferences</p>

          {isLoading && <p>Loading Restaurants...</p>}
          {error && <p>Erro: {error}</p>}

          {!isLoading && !error && (
            <>
              <div className="restaurants-grid">
                {filteredRestaurants.map((restaurant) => (
                  <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="restaurant-card-link">
                    <div className="restaurant-card">
                      <Leaf size={48} color="#16a34a" />
                      <div className="restaurant-content">
                         <h3 className="restaurant-name">{restaurant.name}</h3>
                         <p className="restaurant-description">{restaurant.address}</p>
                         <div className="badges-container">
                           {restaurant.certifications?.map(cert => (
                             <span key={cert.asset_code} className="badge">
                               {cert.asset_code}
                             </span>
                           ))}
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Lógica para mostrar o estado vazio apenas quando não estiver carregando */}
              {filteredRestaurants.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Search size={48} color="#9ca3af" />
                  </div>
                  <h3 className="empty-state-title">Nenhum restaurante encontrado</h3>
                  <p className="empty-state-text">Tente ajustar sua busca ou suas preferências</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserHomePage;