import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Leaf, Shield , AlertCircle} from "lucide-react";
import "./Login.css";
import logoImage from '../../../assets/images/safebite-logo.jpg';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados p/ feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const registerPath = userType === 'cliente' ? '/cadastro' : 'cadastro-restaurante';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    console.log("Login attempt:", { userType, email, password });

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch("http://localhost:8000/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Email ou senha incorretos.");
      }

      const data = await response.json();
      
      // Armazena o token para uso futuro
      localStorage.setItem('authToken', data.data.access_token);

      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redireciona para a página principal após o login
      if(userType === 'cliente') {
        navigate('/user-home');
      } else {
        navigate('/cadastro-restaurante');
      }
      

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <div className="logo-container">
          <img src={logoImage} alt="Logo da SafeBite" className="brand-logo" />
        </div>
      </header>

      {/* Main */}
      <main className="login-main">
        <div className="login-card">
          <div className="card-header">
            <h2 className="welcome-title">Welcome back!</h2>
            <p className="welcome-subtitle">Enter to make your order</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="login-form">
              {/* User type */}
              <div className="user-type-selector">
                <label
                  className={`type-option ${
                    userType === "cliente" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="cliente"
                    checked={userType === "cliente"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  Client
                </label>
                <label
                  className={`type-option ${
                    userType === "restaurante" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="restaurante"
                    checked={userType === "restaurante"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  Restaurant
                </label>
              </div>

              {/* Email */}
              <div className="input-group">
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Loading' : 'Enter the platform'}
              </button>

              {/* Links */}
              <div className="form-links">
                <a href="#forgot" className="forgot-link">
                  Forgot your password?
                </a>
                <Link to ={registerPath} className="register-link">
                  Don't have an account? Register here
                </Link>
              </div>
            </form>

            <div className="blockchain-cert">
              <Shield className="cert-icon" size={16} />
              <span>Safe certification via blockchain</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <p>&copy; 2025 SafeBite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
