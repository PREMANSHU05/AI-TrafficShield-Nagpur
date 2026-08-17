import { useState } from "react";
import axios from "../api";

const locations = ["Sitabuldi", "Sadar", "Manish Nagar", "Hingna Road"];
const incidentTypes = ["Accident", "Road Closure"];
const severities = ["High", "Medium", "Low"];

function Incident() {
  const [form, setForm] = useState({
    location: "Sitabuldi",
    type: "Accident",
    severity: "High",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const reportIncident = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/incident",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setResult(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError.response?.data?.error || "Unable to report incident",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="prediction-page">
      <h1>🚨 Incident Management</h1>
      <p>
        Report an accident or road closure to update risk and deployment
        priority.
      </p>

      <section className="prediction-form" aria-label="Incident report form">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          name="location"
          value={form.location}
          onChange={handleChange}
        >
          {locations.map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>

        <label htmlFor="type">Incident type</label>
        <select id="type" name="type" value={form.type} onChange={handleChange}>
          {incidentTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <label htmlFor="severity">Severity</label>
        <select
          id="severity"
          name="severity"
          value={form.severity}
          onChange={handleChange}
        >
          {severities.map((severity) => (
            <option key={severity}>{severity}</option>
          ))}
        </select>

        <button type="button" onClick={reportIncident} disabled={loading}>
          {loading ? "Registering..." : "🚨 Report Incident"}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {result && (
        <section className="prediction-result" aria-live="polite">
          <h2>Incident Registered</h2>
          <p>
            <strong>Location:</strong> {result.location}
          </p>
          <p>
            <strong>Incident:</strong> {result.type}
          </p>
          <p>
            <strong>Severity:</strong> {result.severity}
          </p>
          <h2>Updated Risk: {result.updatedRisk}/100</h2>
          <p>
            👮 Recommended Officers: <strong>{result.officers}</strong>
          </p>
          <p>
            Priority: <strong>{result.priority}</strong>
          </p>
        </section>
      )}
    </main>
  );
}

export default Incident;
