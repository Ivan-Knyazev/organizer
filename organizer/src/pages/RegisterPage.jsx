import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    age: '',
    contacts: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setError('');
    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="container auth-container">
      <section className="auth-form-section">
        <h2>Регистрация</h2>
        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-email">E-mail (логин)</label>
            <input type="email" id="register-email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Пароль</label>
            <input type="password" id="register-password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="register-confirm-password">Подтвердите Пароль</label>
            <input type="password" id="register-confirm-password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="register-fullname">ФИО</label>
            <input type="text" id="register-fullname" name="fullname" value={formData.fullname} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="register-age">Возраст</label>
            <input type="number" id="register-age" name="age" value={formData.age} onChange={handleChange} min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="register-contacts">Контактные данные (телефон)</label>
            <input type="text" id="register-contacts" name="contacts" value={formData.contacts} onChange={handleChange} />
          </div>
          {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="auth-toggle">
          <Link to="/auth" className="btn btn-link">Уже есть аккаунт? Войти</Link>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;