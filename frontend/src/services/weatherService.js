import apiClient from './api'; // For real API calls

export const getWeatherAPI = async (city) => {
  if (!city) {
    // Можно выбросить ошибку или вернуть Promise.reject, чтобы компонент обработал
    return Promise.reject(new Error('Город не указан'));
  }

  try {
    // Отправляем GET-запрос на бэкенд-эндпоинт
    // Параметр 'city' будет добавлен к URL как query string: /api/weather?city=London
    const response = await apiClient.get('/weather', {
      params: {
        city: city,
      },
    });
    // Ожидаем, что бэкенд вернет данные в формате WeatherResponse
    // { city: "...", averageTemp: ..., sources: [{ name: "...", temp: ..., description: "..."}] }
    return response.data;
  } catch (error) {
    // Обработка ошибок от Axios (сетевые ошибки, ошибки от сервера 4xx, 5xx)
    console.error('Error fetching weather data from backend:', error.response ? error.response.data : error.message);
    // Пробрасываем ошибку дальше, чтобы компонент мог ее обработать и показать пользователю
    // Можно кастомизировать сообщение об ошибке
    const errorMessage = error.response?.data?.error || error.message || 'Не удалось получить данные о погоде';
    throw new Error(errorMessage);
  }
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     if (!city || city.toLowerCase() === "errorcity") {
  //       reject(new Error(`Не удалось получить погоду для города: ${city}`));
  //       return;
  //     }
  //     // Simulate different data for different cities
  //     let tempOffset = 0;
  //     if (city.toLowerCase() === "глазов") tempOffset = -5;
  //     if (city.toLowerCase() === "ижевск") tempOffset = -2;

  //     resolve({
  //       city: city,
  //       averageTemp: 14.75 + tempOffset,
  //       sources: [
  //         { name: 'Yandex Погода', temp: 14 + tempOffset, description: 'облачно, ветер 5 м/с', iconClass: 'wi-day-cloudy' },
  //         { name: 'Google Погода', temp: 15 + tempOffset, description: 'переменная облачность', iconClass: 'wi-day-cloudy-gusts' },
  //         { name: 'Gismeteo', temp: 16 + tempOffset, description: 'облачно, без осадков', iconClass: 'wi-cloud' },
  //         { name: 'Гидрометцентр', temp: 14 + tempOffset, description: 'облачно с прояснениями', iconClass: 'wi-day-sunny-overcast' },
  //       ]
  //     });
  //   }, 800);
  // });
};