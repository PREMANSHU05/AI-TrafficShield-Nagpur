require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { spawn } = require("child_process");
const path = require("path");
const mongoose = require("mongoose");
const Incident = require("./models/Incident");
const User = require("./models/User");
const {
  authenticateToken,
  requireRole,
} = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

function calculateWeatherRisk(condition) {
  const weather = condition.toLowerCase();

  if (weather.includes("thunderstorm") || weather.includes("tornado")) {
    return 90;
  }

  if (weather.includes("rain") || weather.includes("drizzle")) {
    return 70;
  }

  if (
    weather.includes("fog") ||
    weather.includes("mist") ||
    weather.includes("haze")
  ) {
    return 60;
  }

  if (weather.includes("snow")) {
    return 80;
  }

  if (weather.includes("cloud")) {
    return 30;
  }

  if (weather.includes("clear")) {
    return 10;
  }

  return 20;
}

app.get("/", (req, res) => {
  res.json({
    message: "AI TrafficShield Backend is running",
  });
});

app.post("/api/predict", (req, res) => {
  const pythonPath = path.join(__dirname, "..", "ml", "predict.py");

  const data = JSON.stringify(req.body);

  const pythonCmd = process.env.PYTHON || "python";

  let responded = false;

  console.log("Spawning Python:", pythonCmd, pythonPath);
  const pythonCwd = path.join(__dirname, "..", "ml");
  console.log("Python cwd:", pythonCwd);
  const python = spawn(pythonCmd, [pythonPath, data], {
    env: process.env,
    cwd: pythonCwd,
  });

  python.on("error", (err) => {
    console.error("Failed to start Python process:", err);
    if (!responded) {
      responded = true;
      return res
        .status(500)
        .json({ error: `Failed to start Python process: ${err.message}` });
    }
  });

  let result = "";
  let error = "";

  python.stdout.on("data", (chunk) => {
    result += chunk.toString();
  });

  python.stderr.on("data", (chunk) => {
    error += chunk.toString();
  });

  python.on("close", (code) => {
    if (responded) return;
    if (code !== 0) {
      console.error("Python process error:", error);
      responded = true;
      return res
        .status(500)
        .json({ error: "ML prediction failed", details: error });
    }

    try {
      const parsed = JSON.parse(result);
      responded = true;
      return res.json(parsed);
    } catch (e) {
      console.error("Failed to parse ML output:", e, result);
      responded = true;
      return res
        .status(500)
        .json({ error: "Invalid ML response", details: result });
    }
  });
});

app.post(
  "/api/incident",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { location, type, severity } = req.body;

      let riskIncrease;

      if (severity === "High") {
        riskIncrease = 25;
      } else if (severity === "Medium") {
        riskIncrease = 15;
      } else {
        riskIncrease = 5;
      }

      let updatedRisk = 50 + riskIncrease;

      if (updatedRisk > 100) {
        updatedRisk = 100;
      }

      let priority;
      let officers;

      if (updatedRisk >= 80) {
        priority = "Critical";
        officers = 4;
      } else if (updatedRisk >= 60) {
        priority = "High";
        officers = 3;
      } else if (updatedRisk >= 40) {
        priority = "Medium";
        officers = 2;
      } else {
        priority = "Low";
        officers = 1;
      }

      const incident = await Incident.create({
        location,
        type,
        severity,
        updatedRisk,
        priority,
        officers,
      });

      res.status(201).json(incident);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to save incident",
      });
    }
  },
);

app.get("/api/incidents", authenticateToken, async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

app.get("/api/location-risk/:location", authenticateToken, async (req, res) => {
  try {
    const location = req.params.location;

    const incidents = await Incident.find({
      location: location,
    });

    let incidentRisk = 0;

    incidents.forEach((incident) => {
      if (incident.severity === "High") {
        incidentRisk += 25;
      } else if (incident.severity === "Medium") {
        incidentRisk += 15;
      } else {
        incidentRisk += 5;
      }
    });

    if (incidentRisk > 50) {
      incidentRisk = 50;
    }

    res.json({
      location,
      incidentRisk,
      totalIncidents: incidents.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to calculate location risk",
    });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: "Nagpur,IN",
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      },
    );

    const weather = response.data;

    res.json({
      city: weather.name,
      temperature: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      condition: weather.weather[0].main,
      description: weather.weather[0].description,
      windSpeed: weather.wind.speed,
    });
  } catch (error) {
    console.error("Weather API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Unable to fetch weather" });
  }
});

app.get("/api/weather-risk", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: "Nagpur,IN",
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      },
    );

    const weather = response.data;
    const condition = weather.weather[0].main;
    const weatherRisk = calculateWeatherRisk(condition);

    res.json({
      condition,
      weatherRisk,
      temperature: weather.main.temp,
      humidity: weather.main.humidity,
    });
  } catch (error) {
    console.error("Weather risk error:", error.response?.data || error.message);
    res.status(500).json({ error: "Unable to calculate weather risk" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      password: hashedPassword,
      role: role || "police",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/analytics", authenticateToken, async (req, res) => {
  try {
    const incidents = await Incident.find();
    const totalIncidents = incidents.length;
    const highRiskIncidents = incidents.filter(
      (incident) =>
        incident.severity === "High" || incident.severity === "Critical",
    ).length;

    const locationCounts = {};
    incidents.forEach((incident) => {
      const location = incident.location || "Unknown";
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    const incidentsByLocation = Object.entries(locationCounts).map(
      ([location, count]) => ({
        location,
        incidents: count,
      }),
    );

    res.json({
      totalIncidents,
      highRiskIncidents,
      incidentsByLocation,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      error: "Unable to load analytics",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "AI TrafficShield Backend",
    time: new Date(),
  });
});

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
    });

  app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
  });
}

module.exports = app;
