import React, { useState } from 'react';
import { getWeatherAPI } from '../services/weatherService';

function WeatherPage() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchWeather = async () => {
    if (!city) {
      setError('Пожалуйста, введите город.');
      return;
    }
    setIsLoading(true);
    setError('');
    setWeatherData(null);
    try {
      const data = await getWeatherAPI(city);
      setWeatherData(data);
    } catch (err) {
      setError('Ошибка получения данных о погоде: ' + err.message);
      setWeatherData(null); // Clear previous data on error
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

      <div className="weather-search">
        <div className="form-group">
          <label htmlFor="city-select">Выберите или введите город:</label>
          <input 
            type="text" 
            id="city-select" 
            list="cities" 
            placeholder="Например, Москва"
            value={city}
            onChange={(e) => setCity(e.target.value)} 
          />
          <datalist id="cities">
            <option value="Москва" />
            <option value="Глазов" />
            <option value="Ижевск" />
            <option value="Санкт-Петербург" />
            {/* Add more cities */}
          </datalist>
        </div>
        <button className="btn btn-primary" onClick={handleFetchWeather} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Получить погоду'}
        </button>
      </div>
      
      {error && <div className="error-message" style={{ display: 'block', marginTop: '10px' }}>{error}</div>}

      {weatherData && (
        <div className="weather-results" id="weather-results-container">
          <h3>Погода в городе <span id="weather-city-name">{weatherData.city}</span></h3>
          <div id="weather-data">
            {weatherData.sources.map(source => (
              <div className="weather-source" key={source.name}>
                {/* Add weather icons */}
                <strong>{source.name}:</strong> {source.temp}°C, {source.description}
              </div>
            ))}
            <div className="weather-average">
              Усредненная температура: {weatherData.averageTemp}°C
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherPage;