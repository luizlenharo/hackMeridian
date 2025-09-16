import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Importe os componentes do react-router-dom
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import LoginPage from './components/pages/login/LoginUsuario.jsx';
import RegisterPage from './components/register/RegisterPage.jsx';

import './index.css';
import HomePage from './components/pages/HomePage.jsx';
import ResgisterRestaurant from './components/register/RegisterRestaurant.jsx';
import LoginRestaurant from './components/pages/login/LoginRestaurant.jsx';

// 2. Crie a configuração das suas rotas
const router = createBrowserRouter([
  {
    path: "/", // A rota raiz agora será a página de login
    element: <App />,
  },
  {
    path: "/cadastro", // A rota para a nova página
    element: <RegisterPage />,
  },
  // Você pode adicionar mais rotas aqui no futuro
  {
    path: "/login",
    element: <LoginPage/>,
  },
  {
    path: "cadastro-restaurante",
    element: <ResgisterRestaurant/>,
  },
  {
    path: "login-restaurante",
    element: <LoginRestaurant/>,
  },
]);

// 3. Mude o render para usar o RouterProvider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);