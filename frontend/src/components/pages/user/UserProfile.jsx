import React, { useState } from 'react';
import './UserProfile.css';
import { Search, MapPin, User, Wheat, Droplet, Leaf, Moon, Fish, Star, Clock, ChevronDown, Settings, LogOut, Heart, ShoppingBag } from 'lucide-react';


const UserProfile = () => {
 const [activeTab, setActiveTab] = useState('profile');
 const [editMode, setEditMode] = useState(false);
 const [showUserMenu, setShowUserMenu] = useState(false);

 // Dados mockados do usuário
 const [userData, setUserData] = useState({
 name: "John Doe",
 email: "john.doe@email.com",
 phone: "(11) 99999-9999",
 address: "Rua das Flores, 456 - Centro, São Paulo - SP",
 avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&h=120&fit=crop&crop=faces&auto=format&q=80",
 memberSince: "Janeiro 2024",
 totalOrders: 24,
 favoriteRestaurants: 8
 });

 const [dietaryPreferences, setDietaryPreferences] = useState([
 { id: 'gluten-free', name: 'Gluten Free', icon: <Wheat size={20} /> },
 { id: 'lactose-free', name: 'Lactose Free', icon: <Droplet size={20} /> },
 { id: 'vegan', name: 'Vegan', icon: <Leaf size={20} /> },
 { id: 'halal', name: 'Halal', icon: <Moon size={20} /> },
 { id: 'no-seafood', name: 'No Seafood', icon: <Fish size={20} /> },
 { id: 'kosher', name: 'Kosher', icon: <Star size={20} /> }
 ]);

 const recentOrders = [
 {
 id: 1,
 restaurant: "Green Garden",
 restaurantLogo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50&h=50&fit=crop&auto=format&q=80",
 date: "15 Set 2025",
 total: "XLM 23,80",
 status: "Delivered",
 items: ["Mushroom Risotoo", "Green juice"]
 },
 {
 id: 2,
 restaurant: "Vegan Paradise",
 restaurantLogo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=50&h=50&fit=crop&auto=format&q=80",
 date: "12 Sep 2025",
 total: "XLM 19,95",
 status: "Delivered",
 items: ["Vegan Hamburguer", "Smashed Potatoes"]
 },
 {
 id: 3,
 restaurant: "Healthy Bowl",
 restaurantLogo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=50&h=50&fit=crop&auto=format&q=80",
 date: "08 Set 2025",
 total: "XLM 26,15",
 status: "Delivered",
 items: ["Buddha Bowl", "Kombucha", "Brownie Fit"]
 }
 ];

 const favoriteRestaurants = [
 {
 id: 1,
 name: "Green Garden",
 logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop&auto=format&q=80",
 rating: 4.8,
 cuisine: "Vegetariana"
 },
 {
 id: 2,
 name: "Vegan Paradise",
 logo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=60&h=60&fit=crop&auto=format&q=80",
 rating: 4.6,
 cuisine: "Vegana"
 },
 {
 id: 3,
 name: "Healthy Bowl",
 logo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=60&h=60&fit=crop&auto=format&q=80",
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
 <div className="food-delivery-container" onClick={(e) => {
 // Close user menu when clicking outside
 if (!e.target.closest('.user-menu-container')) {
 setShowUserMenu(false); }
 }}>

 {/* Header */}
 <header className="profile-header">
 <div className="header-content">
 <div className="location">
 <MapPin size={20} />
 <span>Your Location</span>
 </div>
 <h1 className="app-title">Food for All</h1>
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
 

 {/* Navigation Tabs */}
 <nav className="profile-navigation">
 <button 
 className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
 onClick={() => setActiveTab('profile')}
 >
 Profile
 </button>
 <button 
 className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
 onClick={() => setActiveTab('orders')}
 >
 Orders
 </button>
 <button 
 className={`nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
 onClick={() => setActiveTab('preferences')}
 >
 Preferences
 </button>
 </nav>

 {/* Main Content */}
 <main className="profile-content">
 {/* Profile Tab */}
 {activeTab === 'profile' && (
 <section className="profile-section">
 <div className="section-header">
 <h3 className="section-title">Informações Pessoais</h3>
 <button 
 className="edit-btn"
 onClick={() => setEditMode(!editMode)}
 >
 {editMode ? 'Cancel' : 'Edit'}
 </button>
 </div>
 
 <div className="profile-form">
 <div className="form-group">
 <label htmlFor="fullName">Nome Completo</label>
 <input 
 id="fullName"
 type="text" 
 value={userData.name}
 disabled={!editMode}
 onChange={(e) => setUserData({...userData, name: e.target.value})}
 />
 </div>
 
 <div className="form-group">
 <label htmlFor="email">Email</label>
 <input 
 id="email"
 type="email" 
 value={userData.email}
 disabled={!editMode}
 onChange={(e) => setUserData({...userData, email: e.target.value})}
 />
 </div>
 
 <div className="form-group">
 <label htmlFor="phone">Telefone</label>
 <input 
 id="phone"
 type="tel" 
 value={userData.phone}
 disabled={!editMode}
 onChange={(e) => setUserData({...userData, phone: e.target.value})}
 />
 </div>
 
 <div className="form-group">
 <label htmlFor="address">Endereço</label>
 <textarea 
 id="address"
 value={userData.address}
 disabled={!editMode}
 rows="2"
 onChange={(e) => setUserData({...userData, address: e.target.value})}
 />
 </div>
 
 {editMode && (
 <button className="save-btn" onClick={handleSaveProfile}>
 Save Changes
 </button>
 )}
 </div>
 </section>
 )}

 {/* Orders Tab */}
 {activeTab === 'orders' && (
 <section className="orders-section">
 <h3 className="section-title">Order history</h3>
 <div className="orders-list">
 {recentOrders.map((order) => (
 <div key={order.id} className="order-card">
 <img src={order.restaurantLogo} alt={order.restaurant} className="order-restaurant-logo" />
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
 <button className="reorder-btn">Order again</button>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* Preferences Tab */}
 {activeTab === 'preferences' && (
 <section className="preferences-section">
 <h3 className="section-title">Dietary preferences</h3>
 <p className="preferences-subtitle">Select your preferences to receive presonalized recommendations</p>
 
 <div className="preferences-grid">
 {dietaryPreferences.map((pref) => (
 <div 
 key={pref.id} 
 className={`preference-card ${pref.active ? 'active' : ''}`}
 onClick={() => togglePreference(pref.id)}
 >
 <span className="preference-icon">{pref.icon}</span>
 <span className="preference-name">{pref.name}</span>
 <div className="preference-toggle">
 <button
 type="button"
 className={`toggle-switch${pref.active ? ' on' : ''}`}
 onClick={(e) => {
 e.stopPropagation();
 togglePreference(pref.id);
 }}
 aria-pressed={pref.active}
 >
 <span className="toggle-handle" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}
 </main>
 </div>
 );
};

export default UserProfile;