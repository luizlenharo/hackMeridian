// src/App.jsx
import React from 'react';
import UserHomePage from "./components/pages/user/UserHomePage.jsx"
import UserProfile from "./components/pages/user/UserProfile.jsx"
import RestaurantPage from './components/pages/restaurant/RestaurantPage.jsx';

function App() {
  // Por enquanto, nosso App apenas mostra a página de login.
  return (
    <RestaurantPage />
  );
}

export default App;