import React, { useState }
from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/"; // Path to redirect after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true }); // Redirect to previous page or home
    } else {
      setError(result.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="container auth-container">
      <section className="auth-form-section">
        <h2>Вход</h2>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Логин (E-mail)</label>
            <input 
              type="email" 
              id="login-username" 
              name="username" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input 
              type="password" 
              id="login-password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="auth-toggle">
          <Link to="/register" className="btn btn-link">Нет аккаунта? Зарегистрироваться</Link>
        </div>
      </section>
    </div>
  );
}

export default AuthPage;