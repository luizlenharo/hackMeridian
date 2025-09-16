import React, { useState } from "react";
import { Mail, Lock, Leaf, Shield } from "lucide-react";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { userType, email, password });
  };

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <div className="logo-container">
          <Leaf className="logo-icon" size={32} />
          <div className="brand-info">
            <h1 className="brand-name">SafeBite</h1>
            <p className="brand-subtitle">
              Garantindo a segurança alimentar via blockchain
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="login-main">
        <div className="login-card">
          <div className="card-header">
            <h2 className="welcome-title">Bem-vindo de volta!</h2>
            <p className="welcome-subtitle">Entre para fazer seus pedidos</p>
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
                  Cliente
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
                  Restaurante
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
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="login-button">
                Entrar na plataforma
              </button>

              {/* Links */}
              <div className="form-links">
                <a href="#forgot" className="forgot-link">
                  Esqueceu sua senha?
                </a>
                <a href="#register" className="register-link">
                  Não tem conta? Cadastre-se aqui
                </a>
              </div>
            </form>

            <div className="blockchain-cert">
              <Shield className="cert-icon" size={16} />
              <span>Certificação segura via blockchain</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <p>&copy; 2024 SafeBite. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Login;
