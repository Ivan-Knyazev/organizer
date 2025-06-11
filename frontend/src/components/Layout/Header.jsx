import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth'); // Redirect to login after logout
  };

  return (
    <header className="header">
      <div className="nav-container">
        <Link to="/" className="logo">Organizer</Link>
        <nav>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/weather">Погода</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/notes">Заметки</Link></li>
                <li><Link to="/knowledge-base">База знаний</Link></li>
                <li className="nav-user-profile">
                    <Link to="/profile" className="nav-avatar-link">
                        <div className="avatar header-avatar">
                            {/* Placeholder for avatar */}
                            {user?.avatarUrl ? <img src={user.avatarUrl} alt="Аватар" /> : <i className="fas fa-user"></i>}
                        </div>
                    </Link>
                    {user && <span style={{color: 'white', marginRight: '10px', marginLeft: '5px'}}>{user.email?.split('@')[0]}</span>}
                    <Link to="/profile" style={{marginRight: '10px'}}>Профиль</Link>
                    <button onClick={handleLogout} className="btn-link" style={{ color: 'white', fontWeight: 500, padding: 0 }}>Выйти</button>
                </li>
              </>
            ) : (
              <li><Link to="/auth">Войти</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;