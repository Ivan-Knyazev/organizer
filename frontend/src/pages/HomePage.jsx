// organizer/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWeatherAPI } from '../services/weatherService';
import { getNotesAPI } from '../services/notesService';
import { getLinksAPI } from '../services/knowledgeBaseService';

function HomePage() {
  const { isAuthenticated } = useAuth();

  // Состояние для погоды
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');

  // Состояние для последней заметки
  const [latestNote, setLatestNote] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false); // Изначально false, загружаем только если авторизован
  const [notesError, setNotesError] = useState('');

  // Состояние для количества ссылок в базе знаний
  const [linksCount, setLinksCount] = useState(0);
  const [linksLoading, setLinksLoading] = useState(false); // Изначально false
  const [linksError, setLinksError] = useState('');

  // Загрузка погоды (выполняется всегда)
  useEffect(() => {
    const fetchInitialWeather = async () => {
      setWeatherLoading(true);
      setWeatherError('');
      try {
        const data = await getWeatherAPI('Москва');
        setWeatherData(data);
      } catch (err) {
        console.error("Failed to fetch weather for Moscow:", err);
        setWeatherError('Не удалось загрузить погоду.');
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchInitialWeather();
  }, []);

  // Загрузка данных для заметок и базы знаний (только если пользователь авторизован)
  useEffect(() => {
    if (isAuthenticated) {
      // Загрузка последней заметки
      const fetchLatestNote = async () => {
        setNotesLoading(true);
        setNotesError('');
        try {
          // Запрашиваем 1 заметку, отсортированную по дате
          // getNotesAPI возвращает { notes: [], totalCount: X }
          const data = await getNotesAPI({ limit: 1, offset: 0 });
          if (data.notes && data.notes.length > 0) {
            setLatestNote(data.notes[0]);
          } else {
            setLatestNote(null); // Нет заметок
          }
        } catch (err) {
          console.error("Failed to fetch latest note:", err);
          setNotesError('Ошибка загрузки заметки.');
        } finally {
          setNotesLoading(false);
        }
      };

      // Загрузка количества ссылок
      const fetchLinksCount = async () => {
        setLinksLoading(true);
        setLinksError('');
        try {
          // getLinksAPI возвращает массив ссылок
          const linksArray = await getLinksAPI();
          setLinksCount(linksArray.length);
        } catch (err) {
          console.error("Failed to fetch links count:", err);
          setLinksError('Ошибка загрузки ссылок.');
        } finally {
          setLinksLoading(false);
        }
      };

      fetchLatestNote();
      fetchLinksCount();
    } else {
      // Сброс данных, если пользователь разлогинился
      setLatestNote(null);
      setNotesLoading(false);
      setNotesError('');
      setLinksCount(0);
      setLinksLoading(false);
      setLinksError('');
    }
  }, [isAuthenticated]); // Зависимость от isAuthenticated

  // Функция для сокращения текста заметки
  const truncateText = (text, maxLength = 25) => {
    if (!text) return "";
    // Сначала уберем HTML теги для корректного подсчета длины видимого текста
    const plainText = text.replace(/<[^>]*>?/gm, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  return (
    <div className="container">
      <h1>Текущая информация</h1>
      
      <div className="intro-text">
        <p>Добро пожаловать в ваш личный Organizer!</p>
        {!isAuthenticated && <p><i>*Для неавторизованных пользователей будет доступна только Погода*</i></p>}
      </div>

      <div className="module-summary-grid">
        {/* --- Карточка Погоды --- */}
        <Link to="/weather" className="card-link">
          <div className="card module-card">
            <h3 className="card-link-indicator">Погода</h3>
            {weatherLoading && <p>Загрузка погоды...</p>}
            {weatherError && <p style={{ color: 'red' }}>{weatherError}</p>}
            {weatherData && !weatherLoading && !weatherError && (
              <>
                <p>[{weatherData.city}]</p>
                <p>
                  {weatherData.averageTemp !== undefined 
                    ? `${weatherData.averageTemp}°C` 
                    : weatherData.sources && weatherData.sources.length > 0 
                      ? `${weatherData.sources[0].temp}°C` 
                      : 'N/A'}
                  , {weatherData.sources && weatherData.sources.length > 0 
                      ? weatherData.sources[0].description.split(',')[0] 
                      : 'Нет данных'}
                </p>
              </>
            )}
            {!weatherData && !weatherLoading && !weatherError && <p>Данные о погоде недоступны.</p>}
          </div>
        </Link>

        {/* --- Карточки для авторизованных пользователей --- */}
        {isAuthenticated && (
          <>
            {/* --- Карточка Заметок --- */}
            <Link to="/notes" className="card-link">
              <div className="card module-card">
                <h3 className="card-link-indicator">Заметки</h3>
                {notesLoading && <p>Загрузка...</p>}
                {notesError && <p style={{ color: 'red' }}>{notesError}</p>}
                {!notesLoading && !notesError && latestNote && (
                  <>
                    <p>Последняя заметка:</p>
                    <p>"{latestNote.title ? truncateText(latestNote.title, 20) : truncateText(latestNote.content, 20) || 'Без текста'}"</p>
                  </>
                )}
                {!notesLoading && !notesError && !latestNote && <p>Заметок пока нет.</p>}
              </div>
            </Link>

            {/* --- Карточка Базы Знаний --- */}
            <Link to="/knowledge-base" className="card-link">
              <div className="card module-card">
                <h3 className="card-link-indicator">База знаний</h3>
                {linksLoading && <p>Загрузка...</p>}
                {linksError && <p style={{ color: 'red' }}>{linksError}</p>}
                {!linksLoading && !linksError && (
                  <p>Сохранено ссылок: {linksCount}</p>
                )}
              </div>
            </Link>
          </>
        )}

        {/* --- Заглушки --- */}
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