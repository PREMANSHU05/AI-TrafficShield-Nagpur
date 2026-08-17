import { useEffect, useState } from "react";
import axios from "../api";

function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get("/api/weather");
        setWeather(response.data);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="weather-card">
        <h2>🌦️ Nagpur Weather</h2>
        <p>Loading weather...</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-card">
        <h2>🌦️ Nagpur Weather</h2>
        <p>Weather unavailable</p>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <div>
        <h2>🌦️ Nagpur Weather</h2>
        <p className="weather-condition">{weather.condition}</p>
      </div>

      <div className="weather-main">
        <strong>{weather.temperature}°C</strong>
      </div>

      <div className="weather-details">
        <span>💧 Humidity: {weather.humidity}%</span>
        <span>🌡️ Feels like: {weather.feelsLike}°C</span>
        <span>💨 Wind: {weather.windSpeed} m/s</span>
      </div>

      <p className="weather-description">{weather.description}</p>
    </div>
  );
}

export default Weather;
