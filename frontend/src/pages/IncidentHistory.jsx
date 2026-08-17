import { useEffect, useState } from "react";
import axios from "../api";

function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/incidents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (isCurrent) setIncidents(response.data);
      })
      .catch((error) => console.error("Failed to fetch incidents:", error))
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="history-page">
      <h1>🚨 Incident History</h1>

      <p>Previously reported traffic incidents.</p>

      {loading ? (
        <p>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div className="empty-state">
          <h2>No incidents reported</h2>
          <p>Reported incidents will appear here.</p>
        </div>
      ) : (
        <div className="incident-list">
          {incidents.map((incident) => (
            <div className="incident-card" key={incident._id}>
              <div>
                <h2>{incident.location}</h2>

                <p>
                  Type: <strong>{incident.type}</strong>
                </p>

                <p>
                  Severity: <strong>{incident.severity}</strong>
                </p>

                <p>Reported: {new Date(incident.createdAt).toLocaleString()}</p>
              </div>

              <div className="incident-result">
                <p>
                  Risk: <strong>{incident.updatedRisk}/100</strong>
                </p>

                <p>
                  Priority: <strong>{incident.priority}</strong>
                </p>

                <p>
                  👮 Officers: <strong>{incident.officers}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IncidentHistory;
