import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "./api";

import RiskMap from "./components/RiskMap";
import Deployment from "./pages/Deployment";
import Incident from "./pages/Incident";
import Prediction from "./pages/Prediction";
import { trafficLocations } from "./data/trafficData";
import { calculateRisk } from "./utils/riskPrediction";
import { getDeploymentRecommendation } from "./utils/deployment";
import Analytics from "./pages/Analytics";
import Weather from "./components/Weather";
import IncidentHistory from "./pages/IncidentHistory";
import AIRecommendations from "./components/AIRecommendations";
import RouteRecommendation from "./components/RouteRecommendation";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Coverage from "./pages/Coverage";

function Dashboard() {
  const [weatherRisk, setWeatherRisk] = useState(0);
  const [weatherCondition, setWeatherCondition] = useState("Clear");
  const [incidentRisk, setIncidentRisk] = useState({});

  useEffect(() => {
    const loadIncidentRisk = async () => {
      try {
        const token = localStorage.getItem("token");
        const results = {};

        for (const location of trafficLocations) {
          const response = await axios.get(
            `http://localhost:5000/api/location-risk/${encodeURIComponent(
              location.name,
            )}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          results[location.name] = response.data;
        }

        setIncidentRisk(results);
      } catch (error) {
        console.error("Failed to load incident risk:", error);
      }
    };

    loadIncidentRisk();
    const incidentInterval = setInterval(loadIncidentRisk, 30000);

    return () => clearInterval(incidentInterval);
  }, []);

  useEffect(() => {
    const fetchWeatherRisk = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/weather-risk",
        );
        setWeatherRisk(response.data.weatherRisk);
        setWeatherCondition(response.data.condition);
      } catch (error) {
        console.error("Failed to fetch weather risk:", error);
      }
    };

    fetchWeatherRisk();
    const weatherInterval = setInterval(fetchWeatherRisk, 30000);

    return () => clearInterval(weatherInterval);
  }, []);

  const locationsWithRisk = trafficLocations.map((location) => {
    const baseRisk = calculateRisk({
      ...location,
      weatherRisk,
    });

    const extraRisk = incidentRisk[location.name]?.incidentRisk || 0;
    const finalScore = Math.min(baseRisk.score + extraRisk, 100);
    const deployment = getDeploymentRecommendation(finalScore);

    const level =
      finalScore >= 70 ? "High" : finalScore >= 40 ? "Medium" : "Low";

    return {
      ...location,
      score: finalScore,
      risk: {
        score: finalScore,
        level,
      },
      priority: deployment.priority,
      incidents: incidentRisk[location.name]?.totalIncidents || 0,
    };
  });
  const highRisk = locationsWithRisk.filter(
    (location) => location.risk.level === "High",
  ).length;
  const mediumRisk = locationsWithRisk.filter(
    (location) => location.risk.level === "Medium",
  ).length;
  const lowRisk = locationsWithRisk.filter(
    (location) => location.risk.level === "Low",
  ).length;
  const totalOfficers = locationsWithRisk.reduce(
    (total, location) =>
      total + getDeploymentRecommendation(location.risk.score).officers,
    0,
  );

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>AI-TrafficShield Nagpur</h1>

          <p>AI-Based Traffic Risk & Police Deployment System</p>
        </div>

        <div className="live-status">
          <span className="live-dot" />
          LIVE SYSTEM
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>🔴 High Risk</h3>
          <h2>{highRisk}</h2>
          <p>Locations</p>
        </div>

        <div className="card">
          <h3>🟠 Medium Risk</h3>
          <h2>{mediumRisk}</h2>
          <p>Locations</p>
        </div>

        <div className="card">
          <h3>🟢 Low Risk</h3>
          <h2>{lowRisk}</h2>
          <p>Locations</p>
        </div>

        <div className="card">
          <h3>👮 Officers</h3>
          <h2>{totalOfficers}</h2>
          <p>Recommended</p>
        </div>
      </div>

      <Weather />

      <section className="map-section">
        <h2>Traffic Risk Map</h2>

        <RiskMap />
      </section>

      <section className="location-list">
        <h2>Location Risk Analysis</h2>

        {locationsWithRisk.map((location) => (
          <div className="location-card" key={location.id}>
            <div>
              <h3>{location.name}</h3>

              <p>
                Risk Score: <strong>{location.risk.score}/100</strong>
              </p>
            </div>

            <strong>{location.risk.level} Risk</strong>
          </div>
        ))}
      </section>

      <AIRecommendations
        locations={locationsWithRisk}
        weatherCondition={weatherCondition}
      />

      <RouteRecommendation locations={locationsWithRisk} />

      <Analytics />
    </main>
  );
}

function App() {
  const user = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <nav className="navbar">
        <h2>🚦 AI-TrafficShield</h2>

        <div className="navbar-links">
          <Link to="/">Dashboard</Link>

          <Link to="/deployment">Police Deployment</Link>

          <Link to="/prediction">AI Prediction</Link>

          <Link to="/incident">Incidents</Link>

          <Link to="/analytics">Analytics</Link>

          <Link to="/coverage">Police Coverage</Link>

          <Link to="/incident-history">History</Link>

          {user ? (
            <button className="logout-button" onClick={handleLogout}>
              Logout ({user.role})
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deployment"
          element={
            <ProtectedRoute allowedRoles={["admin", "police"]}>
              <Deployment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prediction"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Prediction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/incident"
          element={
            <ProtectedRoute allowedRoles={["admin", "police"]}>
              <Incident />
            </ProtectedRoute>
          }
        />

        <Route
          path="/incident-history"
          element={
            <ProtectedRoute allowedRoles={["admin", "police"]}>
              <IncidentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin", "police"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coverage"
          element={
            <ProtectedRoute allowedRoles={["admin", "police"]}>
              <Coverage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
