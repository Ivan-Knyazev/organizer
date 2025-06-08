import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container">
      <h1>Текущая информация</h1>
      
      <div className="intro-text">
        <p>Добро пожаловать в ваш личный Organizer!</p>
        {!isAuthenticated && <p><i>*Для неавторизованных пользователей будет доступна только Погода*</i></p>}
      </div>

      <div className="module-summary-grid">
        <Link to="/weather" className="card-link">
          <div className="card module-card">
            <h3 className="card-link-indicator">Погода</h3>
            <p>[Москва]</p> {/* This would be dynamic */}
            <p>+15°C, Облачно</p> {/* This would be dynamic */}
          </div>
        </Link>

        {isAuthenticated && (
          <>
            <Link to="/notes" className="card-link">
              <div className="card module-card">
                <h3 className="card-link-indicator">Заметки</h3>
                <p>Последняя заметка:</p>
                <p>"Написать frontend..."</p> {/* This would be dynamic */}
              </div>
            </Link>

            <Link to="/knowledge-base" className="card-link">
              <div className="card module-card">
                <h3 className="card-link-indicator">База знаний</h3>
                <p>Сохранено ссылок: 42</p> {/* This would be dynamic */}
              </div>
            </Link>
          </>
        )}

        <div className="card module-card" style={{ opacity: 0.5 }}>
          <h3>Блог (Скоро)</h3>
          <p>Ваш личный блог</p>
        </div>
        <div className="card module-card" style={{ opacity: 0.5 }}>
          <h3>Файлы (Скоро)</h3>
          <p>Доступ к личному S3 хранилищу</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;