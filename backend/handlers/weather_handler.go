package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"organizer-backend/config"
	"organizer-backend/models"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	openWeatherMapURL   = "https://api.openweathermap.org/data/2.5/weather"
	weatherAPIURL       = "http://api.weatherapi.com/v1/current.json"
	openMeteoGeoURL     = "https://geocoding-api.open-meteo.com/v1/search"
	openMeteoWeatherURL = "https://api.open-meteo.com/v1/forecast"
)

var (
	openWeatherMapAPIKey string
	weatherAPI_APIKey    string
	httpClient           = &http.Client{Timeout: 10 * time.Second}
)

// InitializeWeatherKeys загружает ключи API при старте
func InitializeWeatherKeys() {
	config.LoadEnv()
	openWeatherMapAPIKey = config.GetEnv("OPENWEATHERMAP_API_KEY", "")
	weatherAPI_APIKey = config.GetEnv("WEATHERAPI_API_KEY", "")

	if openWeatherMapAPIKey == "" || weatherAPI_APIKey == "" {
		log.Println("Warning: One or more weather API keys are not set in .env file.")
	}
}

// GetWeatherByCity godoc
// @Summary Get weather data for a city from multiple sources
// @Description Fetches current weather information from OpenWeatherMap, WeatherAPI.com, and Open-Meteo.
// @Tags weather
// @Produce json
// @Param city query string true "City name to fetch weather for" example("London")
// @Success 200 {object} models.WeatherResponse
// @Failure 400 {object} object "City parameter is missing (e.g., {\"error\": \"City parameter is required\"})"
// @Failure 500 {object} object "Failed to fetch weather data or all sources failed (e.g., {\"error\": \"Failed to fetch weather data from any source\"})"
// @Router /weather [get]
func GetWeatherByCity(c *gin.Context) {
	cityName := c.Query("city")
	if cityName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "City parameter is required"})
		return
	}

	// Канал для сбора результатов от горутин
	resultsChannel := make(chan models.WeatherSource, 3) // 3 источника
	var wg sync.WaitGroup

	// --- OpenWeatherMap ---
	if openWeatherMapAPIKey != "" {
		wg.Add(1)
		go func(city string) {
			defer wg.Done()
			params := url.Values{}
			params.Add("q", city)
			params.Add("appid", openWeatherMapAPIKey)
			params.Add("units", "metric") // Получать температуру в Цельсиях
			params.Add("lang", "ru")      // По возможности на русском

			resp, err := httpClient.Get(openWeatherMapURL + "?" + params.Encode())
			if err != nil {
				log.Printf("OpenWeatherMap request error for %s: %v", city, err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				log.Printf("OpenWeatherMap API error for %s: Status %d", city, resp.StatusCode)
				// Можно прочитать тело ошибки, если API его предоставляет
				// var errResp interface{}
				// json.NewDecoder(resp.Body).Decode(&errResp)
				// log.Printf("OpenWeatherMap error body: %v", errResp)
				return
			}

			var owmResp models.OpenWeatherMapResponse
			if err := json.NewDecoder(resp.Body).Decode(&owmResp); err != nil {
				log.Printf("OpenWeatherMap JSON decode error for %s: %v", city, err)
				return
			}

			desc := "N/A"
			if len(owmResp.Weather) > 0 {
				desc = owmResp.Weather[0].Description
			}
			windSpeed := fmt.Sprintf("%.1f m/s", owmResp.Wind.Speed)
			fullDesc := fmt.Sprintf("%s, ветер %s", desc, windSpeed)

			resultsChannel <- models.WeatherSource{
				Name:        "OpenWeatherMap",
				Temp:        owmResp.Main.Temp,
				Description: fullDesc,
			}
		}(cityName)
	}

	// --- WeatherAPI.com ---
	if weatherAPI_APIKey != "" {
		wg.Add(1)
		go func(city string) {
			defer wg.Done()
			params := url.Values{}
			params.Add("key", weatherAPI_APIKey)
			params.Add("q", city)
			params.Add("lang", "ru")

			resp, err := httpClient.Get(weatherAPIURL + "?" + params.Encode())
			if err != nil {
				log.Printf("WeatherAPI.com request error for %s: %v", city, err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				log.Printf("WeatherAPI.com API error for %s: Status %d", city, resp.StatusCode)
				return
			}

			var wapiResp models.WeatherAPIResponse
			if err := json.NewDecoder(resp.Body).Decode(&wapiResp); err != nil {
				log.Printf("WeatherAPI.com JSON decode error for %s: %v", city, err)
				return
			}
			windSpeed := fmt.Sprintf("%.1f km/h", wapiResp.Current.WindKph)
			fullDesc := fmt.Sprintf("%s, ветер %s", wapiResp.Current.Condition.Text, windSpeed)

			resultsChannel <- models.WeatherSource{
				Name:        "WeatherAPI.com",
				Temp:        wapiResp.Current.TempC,
				Description: fullDesc,
			}
		}(cityName)
	}

	// --- Open-Meteo ---
	wg.Add(1)
	go func(city string) {
		defer wg.Done()
		// 1. Geocode city to get latitude and longitude
		geoParams := url.Values{}
		geoParams.Add("name", city)
		geoParams.Add("count", "1")
		geoParams.Add("language", "ru") // или en
		geoParams.Add("format", "json")

		geoResp, err := httpClient.Get(openMeteoGeoURL + "?" + geoParams.Encode())
		if err != nil {
			log.Printf("Open-Meteo geocoding request error for %s: %v", city, err)
			return
		}
		defer geoResp.Body.Close()

		if geoResp.StatusCode != http.StatusOK {
			log.Printf("Open-Meteo geocoding API error for %s: Status %d", city, geoResp.StatusCode)
			return
		}

		var geoData models.OpenMeteoGeocodingResponse
		if err := json.NewDecoder(geoResp.Body).Decode(&geoData); err != nil {
			log.Printf("Open-Meteo geocoding JSON decode error for %s: %v", city, err)
			return
		}

		if len(geoData.Results) == 0 {
			log.Printf("Open-Meteo: No geocoding results found for %s", city)
			return
		}
		location := geoData.Results[0]

		// 2. Get current weather using lat/lon
		weatherParams := url.Values{}
		weatherParams.Add("latitude", fmt.Sprintf("%.2f", location.Latitude))
		weatherParams.Add("longitude", fmt.Sprintf("%.2f", location.Longitude))
		weatherParams.Add("current", "temperature_2m,weather_code,wind_speed_10m") // Запрашиваем нужные поля
		weatherParams.Add("timezone", "auto")                                      // Автоматическое определение таймзоны

		weatherResp, err := httpClient.Get(openMeteoWeatherURL + "?" + weatherParams.Encode())
		if err != nil {
			log.Printf("Open-Meteo weather request error for %s: %v", city, err)
			return
		}
		defer weatherResp.Body.Close()

		if weatherResp.StatusCode != http.StatusOK {
			log.Printf("Open-Meteo weather API error for %s: Status %d", city, weatherResp.StatusCode)
			return
		}

		var omWeatherData models.OpenMeteoWeatherResponse
		if err := json.NewDecoder(weatherResp.Body).Decode(&omWeatherData); err != nil {
			log.Printf("Open-Meteo weather JSON decode error for %s: %v", city, err)
			return
		}

		// Map WMO weather code to description (simplified)
		// Полный список: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
		// или https://gist.github.com/stellasphere/9490c195ed2b53c707087c8c2db4ec0c
		// Open-Meteo docs: https://open-meteo.com/en/docs#weathervariables
		weatherDesc := mapWMOCodeToDescription(omWeatherData.CurrentWeather.WeatherCode)
		windSpeed := fmt.Sprintf("%.1f km/h", omWeatherData.CurrentWeather.WindSpeed)
		fullDesc := fmt.Sprintf("%s, ветер %s", weatherDesc, windSpeed)

		resultsChannel <- models.WeatherSource{
			Name:        "Open-Meteo",
			Temp:        omWeatherData.CurrentWeather.Temperature,
			Description: fullDesc,
		}

	}(cityName)

	// Ожидаем завершения всех горутин
	go func() {
		wg.Wait()
		close(resultsChannel) // Закрываем канал, когда все горутины завершены
	}()

	// Собираем результаты
	var sources []models.WeatherSource
	var totalTemp float64
	var validSourcesCount int

	for result := range resultsChannel {
		sources = append(sources, result)
		totalTemp += result.Temp
		validSourcesCount++
	}

	if validSourcesCount == 0 {
		// Если ни один источник не вернул данные (или ключи не установлены)
		log.Printf("No weather data could be fetched for city: %s", cityName)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather data from any source"})
		return
	}

	averageTemp := 0.0
	if validSourcesCount > 0 {
		averageTemp = totalTemp / float64(validSourcesCount)
	}
	averageTemp = math.Round(averageTemp*100) / 100

	response := models.WeatherResponse{
		City:        cityName, // Можно использовать имя города из одного из API для консистентности, если они отличаются
		AverageTemp: averageTemp,
		Sources:     sources,
	}

	c.JSON(http.StatusOK, response)
}

// mapWMOCodeToDescription - упрощенная функция для маппинга WMO кодов погоды Open-Meteo
func mapWMOCodeToDescription(code int) string {
	// Источник: https://open-meteo.com/en/docs WMO Weather interpretation codes (WW)
	switch code {
	case 0:
		return "Ясно"
	case 1:
		return "В основном ясно"
	case 2:
		return "Переменная облачность"
	case 3:
		return "Пасмурно"
	case 45, 48:
		return "Туман" // и изморозь (иней)
	case 51, 53, 55:
		return "Морось" // легкая, умеренная, сильная
	case 56, 57:
		return "Ледяная морось" // легкая, сильная
	case 61, 63, 65:
		return "Дождь" // слабый, умеренный, сильный
	case 66, 67:
		return "Ледяной дождь" // слабый, сильный
	case 71, 73, 75:
		return "Снег" // слабый, умеренный, сильный
	case 77:
		return "Снежные зерна"
	case 80, 81, 82:
		return "Ливень" // слабый, умеренный, сильный
	case 85, 86:
		return "Снежный ливень" // слабый, сильный
	case 95:
		return "Гроза" // слабая или умеренная
	case 96, 99:
		return "Гроза с градом" // слабая, сильная
	default:
		return fmt.Sprintf("Код погоды: %d", code)
	}
}
