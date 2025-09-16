import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Shield, AlertCircle } from "lucide-react";
import "./RegisterPage.css";
import logoImage from '../../../assets/images/safebite-logo.jpg';

// O nome do componente foi corrigido para RegisterPage
const RegisterPage = () => {
  // O estado 'name' foi adicionado
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // O objeto enviado para a API agora usa 'name'
    const userData = {
      name,
      email,
      password,
    };

    try {
      const response = await fetch("http://localhost:8000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Falha ao registrar.");
      }

      console.log("Registro bem-sucedido:", data);
      
      // Redireciona para a página de login após o sucesso
      navigate('/'); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="logo-container">
          <img src={logoImage} alt="Logo da SafeBite" className="brand-logo" />
        </div>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="card-header">
            <h2 className="welcome-title">Crie sua Conta</h2>
            <p className="welcome-subtitle">Insira seus dados para se cadastrar</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="login-form">
              {/* Campo de Nome agora usa os estados corretos 'name' e 'setName' */}
              <div className="input-group">
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
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

              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Registrando...' : 'Criar Conta'}
              </button>

              {/* Link para a página de Login */}
              <div className="form-links">
                <Link to="/" className="register-link">
                  Já tem uma conta? Faça login
                </Link>
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
        <p>&copy; 2025 SafeBite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RegisterPage;