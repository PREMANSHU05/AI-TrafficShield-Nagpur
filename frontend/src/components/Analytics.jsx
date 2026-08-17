import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { trafficLocations } from "../data/trafficData";
import { calculateRisk } from "../utils/riskPrediction";

function Analytics() {
  const data = trafficLocations.map((location) => {
    const risk = calculateRisk(location);

    return {
      name: location.name,
      traffic: location.trafficDensity,
      accidents: location.accidentHistory,
      risk: risk.score,
    };
  });

  return (
    <div className="analytics">
      <h2>📊 Traffic Risk Analytics</h2>

      <div className="chart-card">
        <h3>Risk Score by Location</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Bar dataKey="risk" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Traffic Density vs Accident History</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Bar dataKey="traffic" fill="#3b82f6" name="Traffic Density" />

            <Bar dataKey="accidents" fill="#f59e0b" name="Accident History" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;
