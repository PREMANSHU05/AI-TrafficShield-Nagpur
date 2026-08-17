import RiskMap from "../components/RiskMap";

function Dashboard() {
  return (
    <section className="map-section">
      <h2>Traffic Risk Map</h2>
      <RiskMap />
      <div className="map-legend">
        <span><i className="legend-dot high" />High Risk</span>
        <span><i className="legend-dot medium" />Medium Risk</span>
        <span><i className="legend-dot low" />Low Risk</span>
      </div>
    </section>
  );
}

export default Dashboard;
