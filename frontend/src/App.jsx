// src/App.jsx
import React from 'react';
import UserHomePage from "./components/pages/user/UserHomePage.jsx"
import RestaurantPage from "./components/pages/restaurant/RestaurantPage.jsx";import LoginPage from './components/pages/login/LoginUsuario.jsx';
function App() {

  // Por enquanto, nosso App apenas mostra a página de login.
  return (
    <LoginPage />
  );
}

export default App;