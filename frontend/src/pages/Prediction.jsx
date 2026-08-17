import { useState } from "react";
import axios from "../api";

function Prediction() {
  const [form, setForm] = useState({
    traffic_density: 50,
    accident_history: 50,
    road_condition: 50,
    weather_risk: 50,
    night_risk: 50,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value),
    });
  };

  const predictRisk = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/predict",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResult(response.data.risk);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Unable to connect to prediction server.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-page">
      <h1>🤖 AI Traffic Risk Prediction</h1>

      <p>Enter traffic conditions to predict the risk level.</p>

      <div className="prediction-form">
        <label>Traffic Density: {form.traffic_density}</label>

        <input
          type="range"
          name="traffic_density"
          min="0"
          max="100"
          value={form.traffic_density}
          onChange={handleChange}
        />

        <label>Accident History: {form.accident_history}</label>

        <input
          type="range"
          name="accident_history"
          min="0"
          max="100"
          value={form.accident_history}
          onChange={handleChange}
        />

        <label>Road Condition: {form.road_condition}</label>

        <input
          type="range"
          name="road_condition"
          min="0"
          max="100"
          value={form.road_condition}
          onChange={handleChange}
        />

        <label>Weather Risk: {form.weather_risk}</label>

        <input
          type="range"
          name="weather_risk"
          min="0"
          max="100"
          value={form.weather_risk}
          onChange={handleChange}
        />

        <label>Night Risk: {form.night_risk}</label>

        <input
          type="range"
          name="night_risk"
          min="0"
          max="100"
          value={form.night_risk}
          onChange={handleChange}
        />

        <button onClick={predictRisk} disabled={loading}>
          {loading ? "Predicting..." : "🤖 Predict Risk"}
        </button>
        {error && <p className="error-message">⚠️ {error}</p>}
      </div>

      {result && (
        <div className="prediction-result">
          <h2>AI Prediction</h2>

          <h1>{result}</h1>

          <p>
            The machine learning model predicts this location as{" "}
            <strong>{result} RISK</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

export default Prediction;
