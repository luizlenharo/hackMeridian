import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Importe os componentes do react-router-dom
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import LoginPage from './components/pages/login/Login.jsx';
import RegisterPage from './components/pages/register/RegisterPage.jsx';

import './index.css';
import UserHomePage from './components/pages/user/UserHomePage.jsx';
import ResgisterRestaurant from './components/pages/register/RegisterRestaurant.jsx';
import RestaurantPage from './components/pages/restaurant/RestaurantPage.jsx';

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

  {
    path: "cadastro-restaurante",
    element: <ResgisterRestaurant/>,
  },
  {
    path: "restaurant/:id",
    element: <RestaurantPage/>,
  },
  {
    path: "user-home",
    element: <UserHomePage />,
  }
]);

// 3. Mude o render para usar o RouterProvider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);