import { useEffect, useState } from "react";
import axios from "../api";

import { trafficLocations } from "../data/trafficData";
import { calculateRisk } from "../utils/riskPrediction";

function getDeployment(score) {
  if (score >= 80) {
    return {
      officers: 4,
      priority: "CRITICAL",
      recommendation: "Immediate police deployment required",
    };
  }

  if (score >= 60) {
    return {
      officers: 3,
      priority: "HIGH",
      recommendation: "Deploy additional police units",
    };
  }

  if (score >= 40) {
    return {
      officers: 2,
      priority: "MEDIUM",
      recommendation: "Maintain police presence",
    };
  }

  return {
    officers: 1,
    priority: "LOW",
    recommendation: "Normal monitoring",
  };
}

function Deployment() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRiskData = async () => {
      try {
        const token = localStorage.getItem("token");
        const updatedLocations = [];

        for (const location of trafficLocations) {
          const baseRisk = calculateRisk(location);

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

          const incidentRisk = response.data.incidentRisk || 0;

          const finalScore = Math.min(baseRisk.score + incidentRisk, 100);

          const deployment = getDeployment(finalScore);

          updatedLocations.push({
            ...location,
            score: finalScore,
            incidents: response.data.totalIncidents || 0,
            ...deployment,
          });
        }

        setLocations(updatedLocations);
      } catch (error) {
        console.error("Failed to load deployment data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRiskData();
  }, []);

  if (loading) {
    return (
      <div className="deployment-page">
        <h1>👮 Police Deployment</h1>
        <p>Loading AI deployment recommendations...</p>
      </div>
    );
  }

  return (
    <div className="deployment-page">
      <h1>👮 AI Police Deployment</h1>

      <p>
        Police deployment recommendations based on current traffic risk and
        reported incidents.
      </p>

      <div className="deployment-grid">
        {locations.map((location) => (
          <div className="deployment-card" key={location.id}>
            <div>
              <h2>{location.name}</h2>

              <p>
                AI Risk Score: <strong>{location.score}/100</strong>
              </p>

              <p>
                🚨 Incidents: <strong>{location.incidents}</strong>
              </p>
            </div>

            <div>
              <h3>{location.priority}</h3>

              <p>
                👮 Officers: <strong>{location.officers}</strong>
              </p>

              <p>{location.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Deployment;
