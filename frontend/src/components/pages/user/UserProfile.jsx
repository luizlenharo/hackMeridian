import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);

  // Dados mockados do usuário
  const [userData, setUserData] = useState({
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 456 - Centro, São Paulo - SP",
    avatar: "https://via.placeholder.com/120x120/22c55e/ffffff?text=JS",
    memberSince: "Janeiro 2024",
    totalOrders: 24,
    favoriteRestaurants: 8
  });

  const [dietaryPreferences, setDietaryPreferences] = useState([
    { id: 'gluten-free', name: 'Gluten-free', icon: '🌾', active: true },
    { id: 'lactose-free', name: 'Lactose-Free', icon: '🥛', active: false },
    { id: 'vegan', name: 'Vegan', icon: '🥬', active: true },
    { id: 'halal', name: 'Halal', icon: '🌙', active: false },
    { id: 'no-seafood', name: 'No Seafood', icon: '🐟', active: false },
    { id: 'kosher', name: 'Kosher', icon: '⭐', active: false }
  ]);

  const recentOrders = [
    {
      id: 1,
      restaurant: "Green Garden",
      restaurantLogo: "https://via.placeholder.com/50x50/22c55e/ffffff?text=GG",
      date: "15 Set 2025",
      total: "R$ 45,80",
      status: "Entregue",
      items: ["Risotto de Cogumelos", "Suco Verde"]
    },
    {
      id: 2,
      restaurant: "Vegan Paradise",
      restaurantLogo: "https://via.placeholder.com/50x50/10b981/ffffff?text=VP",
      date: "12 Set 2025",
      total: "R$ 38,90",
      status: "Entregue",
      items: ["Hambúrguer Vegano", "Batata Doce"]
    },
    {
      id: 3,
      restaurant: "Healthy Bowl",
      restaurantLogo: "https://via.placeholder.com/50x50/059669/ffffff?text=HB",
      date: "08 Set 2025",
      total: "R$ 52,30",
      status: "Entregue",
      items: ["Buddha Bowl", "Kombucha", "Brownie Fit"]
    }
  ];

  const favoriteRestaurants = [
    {
      id: 1,
      name: "Green Garden",
      logo: "https://via.placeholder.com/60x60/22c55e/ffffff?text=GG",
      rating: 4.8,
      cuisine: "Vegetariana"
    },
    {
      id: 2,
      name: "Vegan Paradise",
      logo: "https://via.placeholder.com/60x60/10b981/ffffff?text=VP",
      rating: 4.6,
      cuisine: "Vegana"
    },
    {
      id: 3,
      name: "Healthy Bowl",
      logo: "https://via.placeholder.com/60x60/059669/ffffff?text=HB",
      rating: 4.7,
      cuisine: "Saudável"
    }
  ];

  const togglePreference = (preferenceId) => {
    setDietaryPreferences(prev =>
      prev.map(pref =>
        pref.id === preferenceId ? { ...pref, active: !pref.active } : pref
      )
    );
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    // Lógica para salvar dados do perfil
    console.log('Saving profile data:', userData);
  };

  return (
    <div className="user-profile">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="location">
            <span className="location-icon">📍</span>
            <span>Sua Localização</span>
          </div>
          <h1 className="app-title">Food for All</h1>
          <div className="user-menu">
            <span>John Doe ▼</span>
          </div>
        </div>
      </header>

      {/* Profile Cover */}
      <div className="profile-cover">
        <div className="cover-bg"></div>
        <div className="profile-info">
          <img src={userData.avatar} alt="User Avatar" className="user-avatar" />
          <div className="user-details">
            <h2 className="user-name">{userData.name}</h2>
            <p className="user-email">{userData.email}</p>
            <div className="user-stats">
              <div className="stat">
                <span className="stat-number">{userData.totalOrders}</span>
                <span className="stat-label">Pedidos</span>
              </div>
              <div className="stat">
                <span className="stat-number">{userData.favoriteRestaurants}</span>
                <span className="stat-label">Favoritos</span>
              </div>
              <div className="stat">
                <span className="stat-text">{userData.memberSince}</span>
                <span className="stat-label">Membro desde</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-navigation">
        <button 
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        <button 
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Pedidos
        </button>

        <button 
          className={`nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferências
        </button>
      </div>

      {/* Main Content */}
      <main className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">Informações Pessoais</h3>
              <button 
                className="edit-btn"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            <div className="profile-form">
              <div className="form-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  value={userData.name}
                  disabled={!editMode}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={userData.email}
                  disabled={!editMode}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Telefone</label>
                <input 
                  type="tel" 
                  value={userData.phone}
                  disabled={!editMode}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Endereço</label>
                <textarea 
                  value={userData.address}
                  disabled={!editMode}
                  rows="2"
                  onChange={(e) => setUserData({...userData, address: e.target.value})}
                />
              </div>
              
              {editMode && (
                <button className="save-btn" onClick={handleSaveProfile}>
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h3 className="section-title">Histórico de Pedidos</h3>
            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <img src={order.restaurantLogo} alt="Restaurant" className="order-restaurant-logo" />
                  <div className="order-info">
                    <div className="order-header">
                      <h4 className="order-restaurant">{order.restaurant}</h4>
                      <span className="order-status delivered">{order.status}</span>
                    </div>
                    <p className="order-items">{order.items.join(', ')}</p>
                    <div className="order-footer">
                      <span className="order-date">{order.date}</span>
                      <span className="order-total">{order.total}</span>
                    </div>
                  </div>
                  <button className="reorder-btn">Pedir Novamente</button>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h3 className="section-title">Preferências Dietárias</h3>
            <p className="preferences-subtitle">Selecione suas preferências para receber recomendações personalizadas</p>
            
            <div className="preferences-grid">
              {dietaryPreferences.map((pref) => (
                <div 
                  key={pref.id} 
                  className={`preference-card ${pref.active ? 'active' : ''}`}
                  onClick={() => togglePreference(pref.id)}
                >
                  <span className="preference-icon">{pref.icon}</span>
                  <span className="preference-name">{pref.name}</span>
                  <button
                    type="button"
                    className={`toggle-switch${pref.active ? ' on' : ''}`}
                    onClick={() => togglePreference(pref.id)}
                    aria-pressed={pref.active}
                  >
                    <span className="toggle-handle" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;