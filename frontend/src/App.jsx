// src/App.jsx
import React from 'react';
import UserHomePage from "./components/pages/user/UserHomePage.jsx"
import UserProfile from "./components/pages/user/UserProfile.jsx";function App() {

  // Por enquanto, nosso App apenas mostra a página de login.
  return (
    <UserProfile />
  );
}

export default App;