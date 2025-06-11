import React, { useState, useEffect } from 'react';
import { getWeatherAPI } from '../services/weatherService';

function WeatherPage() {
  const [inputCity, setInputCity] = useState(''); // Город из поля ввода
  const [requestedCity, setRequestedCity] = useState(''); // Город, для которого был сделан запрос (для отображения в заголовке)
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchWeather = async (e) => {
    // Если используется в form onSubmit
    if (e) e.preventDefault(); 
    
    if (!inputCity.trim()) {
      setError('Пожалуйста, введите название города.');
      setWeatherData(null); // Очищаем предыдущие данные
      return;
    }
    
    setIsLoading(true);
    setError('');
    setWeatherData(null); // Очищаем предыдущие данные перед новым запросом
    setRequestedCity(inputCity); // Сохраняем город, для которого делаем запрос

    try {
      const data = await getWeatherAPI(inputCity);
      setWeatherData(data);
    } catch (err) {
      // Ошибка уже обработана и проброшена из getWeatherAPI
      setError(err.message); 
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Погода</h1>
      <div className="intro-text">
        <p>Получите сводку по погоде из разных источников</p>
      </div>

      <form onSubmit={handleFetchWeather} className="weather-search">
        <div className="form-group">
          <label htmlFor="city-input">Введите город:</label>
          <input 
            type="text" 
            id="city-input" 
            list="cities-datalist"
            placeholder="Например, Москва"
            value={inputCity}
            onChange={(e) => {
              setInputCity(e.target.value);
              if (error && e.target.value.trim()) setError(''); // Сбрасываем ошибку при вводе
            }}
          />
          {/* Datalist для подсказок, если они вам нужны статически */}
          <datalist id="cities-datalist">
            <option value="Москва" />
            <option value="Глазов" />
            <option value="Ижевск" />
            <option value="Санкт-Петербург" />
            {/* Add more cities */}
          </datalist>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Получить погоду'}
        </button>
      </form>
      
      {/* Сообщение об ошибке */}
      {error && !isLoading && (
        <div className="error-message" style={{ display: 'block', marginTop: '20px' }}>
          {error}
        </div>
      )}

      {/* Результаты погоды */}
      {isLoading && <p style={{ marginTop: '20px' }}>Загрузка данных о погоде для города {requestedCity}...</p>}
      
      {!isLoading && weatherData && !error && (
        <div className="weather-results" style={{ marginTop: '20px' }}>
          <h3>Погода в городе <span id="weather-city-name">{weatherData.city}</span></h3>
          <div id="weather-data">
            {weatherData.sources && weatherData.sources.length > 0 ? (
              weatherData.sources.map(source => (
                <div className="weather-source" key={source.name}>
                  {/* TODO: Добавить иконки погоды, если бэкенд их возвращает или маппинг на фронте */}
                  {/* source.iconClass && <i className={`wi ${source.iconClass}`}></i> */}
                  <strong>{source.name}:</strong> {source.temp}°C, {source.description}
                </div>
              ))
            ) : (
              <p>Данные от источников не получены.</p>
            )}
            {weatherData.sources && weatherData.sources.length > 0 && (
                 <div className="weather-average">
                    {/* <i className="wi wi-thermometer"></i> */}
                    Усредненная температура: {weatherData.averageTemp}°C
                 </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !weatherData && !error && requestedCity && (
          <p style={{ marginTop: '20px' }}>Нет данных о погоде для города {requestedCity}.</p>
      )}
       {!isLoading && !error && !requestedCity && !inputCity && ( // Начальное состояние до первого запроса
          <p style={{ marginTop: '20px' }}><i>Введите город и нажмите "Получить погоду".</i></p>
      )}
    </div>
  );
}

export default WeatherPage;