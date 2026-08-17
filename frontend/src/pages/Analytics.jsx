import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { trafficLocations } from "../data/trafficData";

function Analytics() {
  const [riskData, setRiskData] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  const [deploymentData, setDeploymentData] = useState([]);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    highRiskLocations: 0,
    policeOfficers: 0,
    avgRisk: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch incidents
        const incidentRes = await axios.get(
          "http://localhost:5000/api/incidents",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Build incident data by location
        const incidentsByLocation = {};
        trafficLocations.forEach((location) => {
          incidentsByLocation[location.name] = 0;
        });

        incidentRes.data.forEach((incident) => {
          if (incidentsByLocation.hasOwnProperty(incident.location)) {
            incidentsByLocation[incident.location] += 1;
          }
        });

        const incidentChartData = Object.keys(incidentsByLocation).map(
          (location) => ({
            location,
            incidents: incidentsByLocation[location],
          }),
        );

        // Fetch location risk data
        const locationRiskPromises = trafficLocations.map((location) =>
          axios.get(
            `http://localhost:5000/api/location-risk/${encodeURIComponent(
              location.name,
            )}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        );

        const locationRiskResponses = await Promise.all(locationRiskPromises);

        // Build deployment and risk data
        const deploymentChartData = trafficLocations.map((location, idx) => {
          const incidentRisk =
            locationRiskResponses[idx].data.incidentRisk || 0;
          const baseRisk =
            (location.trafficDensity * 0.5 +
              location.accidentHistory * 0.3 +
              location.nightRisk * 0.2) /
            100;
          const totalRisk = Math.min((baseRisk * 100 + incidentRisk) / 2, 100);

          let officers = 1;
          if (totalRisk >= 80) officers = 4;
          else if (totalRisk >= 60) officers = 3;
          else if (totalRisk >= 40) officers = 2;

          return {
            location: location.name,
            officers,
            risk: Math.round(Math.max(totalRisk, 0)),
          };
        });

        // Build risk trend (simulated weekly data)
        const riskTrendData = [];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        
        if (deploymentChartData.length > 0) {
          const avgRisk =
            deploymentChartData.reduce((sum, d) => sum + d.risk, 0) /
            deploymentChartData.length;
          
          days.forEach((day, idx) => {
            const variation = Math.sin(idx * 0.5) * 15;
            const riskValue = Math.round(
              Math.max(0, Math.min(avgRisk + variation, 100))
            );
            riskTrendData.push({
              day,
              risk: riskValue,
            });
          });
        }

        setRiskData(riskTrendData);
        setIncidentData(incidentChartData);
        setDeploymentData(deploymentChartData);

        // Calculate stats
        const totalIncidents = incidentRes.data.length;
        const highRiskCount = deploymentChartData.filter(
          (d) => d.risk >= 70,
        ).length;
        const totalOfficers = deploymentChartData.reduce(
          (sum, d) => sum + d.officers,
          0,
        );
        const avgRiskScore =
          deploymentChartData.length > 0
            ? Math.round(
                deploymentChartData.reduce((sum, d) => sum + d.risk, 0) /
                  deploymentChartData.length,
              )
            : 0;

        setStats({
          totalIncidents,
          highRiskLocations: highRiskCount,
          policeOfficers: totalOfficers,
          avgRisk: avgRiskScore,
        });
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setError(
          error.response?.data?.error ||
            "Failed to load analytics data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <h1>📊 Traffic Analytics</h1>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <h1>📊 Traffic Analytics</h1>
        <p className="error-message">⚠️ {error}</p>
      </div>
    );
  }

  if (!deploymentData.length) {
    return (
      <div className="analytics-page">
        <h1>📊 Traffic Analytics</h1>
        <p>No data available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>📊 Traffic Analytics</h1>
          <p>Real-time insights into traffic risk and police deployment</p>
        </div>
        <div className="live-status">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      {/* STATS */}
      <div className="analytics-stats">
        <div className="analytics-stat">
          <h3>🚨 Total Incidents</h3>
          <h2>{stats.totalIncidents}</h2>
          <p>Reported this period</p>
        </div>

        <div className="analytics-stat">
          <h3>🔴 High Risk</h3>
          <h2>{stats.highRiskLocations}</h2>
          <p>Locations</p>
        </div>

        <div className="analytics-stat">
          <h3>👮 Officers</h3>
          <h2>{stats.policeOfficers}</h2>
          <p>Recommended</p>
        </div>

        <div className="analytics-stat">
          <h3>📈 Avg Risk</h3>
          <h2>{stats.avgRisk}/100</h2>
          <p>Overall</p>
        </div>
      </div>

      {/* RISK TREND */}
      <div className="analytics-chart">
        <h2>📈 Weekly Risk Trend</h2>
        {riskData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="risk"
                name="Risk Score"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="analytics-empty">No trend data available</p>
        )}
      </div>

      {/* INCIDENTS */}
      <div className="analytics-chart">
        <h2>🚨 Incidents by Location</h2>
        {incidentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={incidentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="incidents" name="Incidents" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="analytics-empty">No incident data available</p>
        )}
      </div>

      {/* POLICE DEPLOYMENT */}
      <div className="analytics-chart">
        <h2>👮 Police Deployment</h2>
        {deploymentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={deploymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="officers" name="Officers" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="analytics-empty">No deployment data available</p>
        )}
      </div>
    </div>
  );
}

export default Analytics;
