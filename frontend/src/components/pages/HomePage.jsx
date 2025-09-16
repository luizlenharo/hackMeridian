import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Welcome to Food for All!</h1>
        <p className="home-subtitle">
          Do you wish to register as a client or restaurant?
        </p>

        <div className="button-group">
          <button
            className="choice-button"
            onClick={() => navigate("/login")}
          >
            Login as Client
          </button>

          <button
            className="choice-button"
            onClick={() => navigate("/login-restaurante")}
          >
            Login as Restaurant
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
