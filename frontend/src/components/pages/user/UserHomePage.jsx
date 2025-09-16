import React, { useState } from 'react';
import { Search, MapPin, User, Wheat, Droplet, Leaf, Moon, Fish, Star, Clock } from 'lucide-react';

const UserHomePage = () => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const dietaryPreferences = [
    { id: 'gluten-free', label: 'Gluten-Free', icon: <Wheat className="w-5 h-5" /> },
    { id: 'lactose-free', label: 'Lactose-Free', icon: <Droplet className="w-5 h-5" /> },
    { id: 'vegan', label: 'Vegan', icon: <Leaf className="w-5 h-5" /> },
    { id: 'halal', label: 'Halal', icon: <Moon className="w-5 h-5" /> },
    { id: 'no-seafood', label: 'No Seafood', icon: <Fish className="w-5 h-5" /> },
    { id: 'kosher', label: 'Kosher', icon: <Star className="w-5 h-5" /> }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 text-sm">Your Location</span>
            </div>
            <h1 className="text-2xl font-bold text-green-600">Food for All</h1>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-full text-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search restaurants or dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dietary Preferences */}
        <div className="text-center mb-12">
          <h2 className="text-xl text-gray-700 mb-8">Choose your dietary preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {dietaryPreferences.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  selectedPreferences.includes(pref.id)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  {pref.icon}
                  <span className="font-medium text-sm">{pref.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Perfect restaurants for you</h2>
          <p className="text-gray-600 text-center mb-8">Curated based on popular dietary-friendly options</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 hidden items-center justify-center">
                    <Leaf className="w-12 h-12 text-green-500" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">{restaurant.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{restaurant.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.badges.map((badge) => {
                      const pref = dietaryPreferences.find(p => p.id === badge);
                      return (
                        <span key={badge} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          {pref?.icon && <span className="mr-1 scale-75">{pref.icon}</span>}
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
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your search or dietary preferences</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserHomePage;