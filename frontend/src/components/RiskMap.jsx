import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { trafficLocations } from "../data/trafficData";
import { calculateRisk } from "../utils/riskPrediction";
import { getDeploymentRecommendation } from "../utils/deployment";

function RiskMap() {
  return (
    <MapContainer
      center={[21.1458, 79.0882]}
      zoom={12}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "10px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {trafficLocations.map((location) => {
        const risk = calculateRisk(location);

        const deployment = getDeploymentRecommendation(risk.score);

        let riskColor;

        if (risk.level === "High") {
          riskColor = "red";
        } else if (risk.level === "Medium") {
          riskColor = "orange";
        } else {
          riskColor = "green";
        }

        return (
          <div key={location.id}>
            <Marker position={location.position}>
              <Popup>
                <div style={{ minWidth: "220px" }}>
                  <h3>{location.name}</h3>

                  <hr />

                  <p>
                    <strong>AI Risk Score:</strong> {risk.score}/100
                  </p>

                  <p>
                    <strong>Risk Level:</strong> {risk.level}
                  </p>

                  <hr />

                  <p>Traffic Density: {location.trafficDensity}</p>

                  <p>Accident History: {location.accidentHistory}</p>

                  <p>Road Condition: {location.roadCondition}</p>

                  <p>Weather Risk: {location.weatherRisk}</p>

                  <p>Night Risk: {location.nightRisk}</p>

                  <hr />

                  <p>
                    👮 <strong>Officers:</strong> {deployment.officers}
                  </p>

                  <p>
                    <strong>Priority:</strong> {deployment.priority}
                  </p>

                  <p>{deployment.recommendation}</p>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={location.position}
              radius={500}
              pathOptions={{
                color: riskColor,
                fillColor: riskColor,
                fillOpacity: 0.25,
              }}
            />
          </div>
        );
      })}
    </MapContainer>
  );
}

export default RiskMap;
