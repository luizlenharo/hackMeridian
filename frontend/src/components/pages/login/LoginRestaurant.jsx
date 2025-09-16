
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginUsuario.css'; // O CSS para esta página

function LoginRestaurant() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulacao da chamada de API
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
      alert("✅ Login realizado com sucesso!");
    // aqui você pode redirecionar com useNavigate()
    } else {
      alert("❌ Email ou senha incorretos!");
    }
    console.log('Login com:', { email, password });
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome Back!</h2>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password"> Password </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Log In</button>
        </form>
        <div className='signup-link'>
          <p> 
            Don't have an account? <Link to="/cadastro"> Register Here! </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginRestaurant;