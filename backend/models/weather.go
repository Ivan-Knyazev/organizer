package models

// WeatherSource represents data from a single weather provider
type WeatherSource struct {
	Name        string  `json:"name"`
	Temp        float64 `json:"temp"` // Temperature in Celsius
	Description string  `json:"description"`
	// IconClass string  `json:"iconClass,omitempty"` // Optional: for weather icons
}

// WeatherResponse is the structure for the API response to the frontend
type WeatherResponse struct {
	City        string          `json:"city"`
	AverageTemp float64         `json:"averageTemp"`
	Sources     []WeatherSource `json:"sources"`
}

// --- Structs for OpenWeatherMap API Response ---
type OpenWeatherMapResponse struct {
	Main struct {
		Temp float64 `json:"temp"`
	} `json:"main"`
	Weather []struct {
		Description string `json:"description"`
		Main        string `json:"main"` // e.g., "Clouds", "Rain", ...
	} `json:"weather"`
	Wind struct {
		Speed float64 `json:"speed"`
	} `json:"wind"`
	Name string `json:"name"` // City name from API
}

// --- Structs for WeatherAPI.com API Response ---
type WeatherAPIResponse struct {
	Location struct {
		Name string `json:"name"`
	} `json:"location"`
	Current struct {
		TempC     float64 `json:"temp_c"`
		Condition struct {
			Text string `json:"text"` // e.g., "Partly cloudy"
		} `json:"condition"`
		WindKph float64 `json:"wind_kph"`
	} `json:"current"`
}

// --- Structs for Open-Meteo Geocoding API Response ---
type OpenMeteoGeocodingResult struct {
	ID        int32   `json:"id"`
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
type OpenMeteoGeocodingResponse struct {
	Results []OpenMeteoGeocodingResult `json:"results"`
}

// --- Structs for Open-Meteo Current Weather API Response ---
type OpenMeteoCurrentWeather struct {
	Temperature float64 `json:"temperature_2m"` // Assuming we request temperature_2m
	WeatherCode int     `json:"weather_code"`   // WMO Weather interpretation codes
	WindSpeed   float64 `json:"wind_speed_10m"` // Assuming wind_speed_10m
}
type OpenMeteoWeatherResponse struct {
	Latitude       float64                 `json:"latitude"`
	Longitude      float64                 `json:"longitude"`
	CurrentWeather OpenMeteoCurrentWeather `json:"current"`
}
