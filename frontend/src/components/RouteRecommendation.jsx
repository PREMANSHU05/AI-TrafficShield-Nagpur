import { getAlternateRoute } from "../utils/routeRecommendation";

function RouteRecommendation({ locations }) {
  const highRiskLocations = locations.filter(
    (location) => location.score >= 60,
  );

  return (
    <section className="route-section">
      <h2>🗺️ Traffic Diversion Recommendations</h2>

      {highRiskLocations.length === 0 ? (
        <div className="route-empty">🟢 No route diversions required.</div>
      ) : (
        highRiskLocations.map((location) => {
          const route = getAlternateRoute(location.name, location.score);

          return (
            <div className="route-card" key={location.id}>
              <h3>{location.name}</h3>

              <p>
                🔴 High-risk route: <strong>{route.blocked}</strong>
              </p>

              <p>
                🟢 Recommended route: <strong>{route.alternate}</strong>
              </p>

              <p>Reason: {route.reason}</p>
            </div>
          );
        })
      )}
    </section>
  );
}

export default RouteRecommendation;
