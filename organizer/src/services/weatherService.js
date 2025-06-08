// import apiClient from './api'; // For real API calls

export const getWeatherAPI = async (city) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!city || city.toLowerCase() === "errorcity") {
          reject(new Error(`Не удалось получить погоду для города: ${city}`));
          return;
        }
        // Simulate different data for different cities
        let tempOffset = 0;
        if (city.toLowerCase() === "глазов") tempOffset = -5;
        if (city.toLowerCase() === "ижевск") tempOffset = -2;
  
        resolve({
          city: city,
          averageTemp: 14.75 + tempOffset,
          sources: [
            { name: 'Yandex Погода', temp: 14 + tempOffset, description: 'облачно, ветер 5 м/с', iconClass: 'wi-day-cloudy' },
            { name: 'Google Погода', temp: 15 + tempOffset, description: 'переменная облачность', iconClass: 'wi-day-cloudy-gusts' },
            { name: 'Gismeteo', temp: 16 + tempOffset, description: 'облачно, без осадков', iconClass: 'wi-cloud' },
            { name: 'Гидрометцентр', temp: 14 + tempOffset, description: 'облачно с прояснениями', iconClass: 'wi-day-sunny-overcast' },
          ]
        });
      }, 800);
    });
  };