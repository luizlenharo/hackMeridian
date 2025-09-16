import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css'

function RegisterPage() {
    const[name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Registered with:', { name, email, password });
        navigate('/login');
    };
    return (
    <div className="register-container">
      <div className="form-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Welcome to Food for All!</h2>
          <div className="input-group">
            <label htmlFor="nome"> Name </label>
            <input
                type="nome"
                id = "email"
                value={name}
                onChange= {(e) => setName(e.target.value)}
            />
          </div>
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
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
export default RegisterPage;