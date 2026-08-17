const test = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");

const app = require("../server");

const originalAxiosGet = axios.get;

const mockWeatherData = {
  data: {
    name: "Nagpur",
    main: {
      temp: 29.5,
      feels_like: 31.2,
      humidity: 72,
    },
    weather: [{ main: "Clouds", description: "overcast clouds" }],
    wind: { speed: 3.1 },
  },
};

test("GET /api/weather returns Nagpur weather data", async () => {
  axios.get = async () => mockWeatherData;

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/weather`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.city, "Nagpur");
    assert.equal(body.temperature, 29.5);
    assert.equal(body.feelsLike, 31.2);
    assert.equal(body.humidity, 72);
    assert.equal(body.condition, "Clouds");
    assert.equal(body.description, "overcast clouds");
    assert.equal(body.windSpeed, 3.1);
  } finally {
    axios.get = originalAxiosGet;
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

test("GET /api/weather-risk returns calculated weather risk", async () => {
  axios.get = async () => mockWeatherData;

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/weather-risk`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.condition, "Clouds");
    assert.equal(body.weatherRisk, 30);
    assert.equal(body.temperature, 29.5);
    assert.equal(body.humidity, 72);
  } finally {
    axios.get = originalAxiosGet;
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});
