import { generateRecommendation } from "../utils/recommendation";

function AIRecommendations({ locations, weatherCondition }) {
  const highRiskLocations = locations.filter(
    (location) => location.score >= 60,
  );

  return (
    <section className="ai-recommendations">
      <div className="section-header">
        <h2>🤖 AI Traffic Recommendations</h2>
        <span>Live Decision Support</span>
      </div>

      {highRiskLocations.length === 0 ? (
        <div className="recommendation-empty">
          <h3>🟢 No critical recommendations</h3>
          <p>Current traffic conditions are within acceptable limits.</p>
        </div>
      ) : (
        highRiskLocations.map((location) => {
          const recommendations = generateRecommendation({
            location: location.name,
            score: location.score,
            incidents: location.incidents,
            weatherCondition,
          });

          return (
            <div className="recommendation-card" key={location.id}>
              <div className="recommendation-title">
                <div>
                  <h3>{location.name}</h3>
                  <p>
                    Risk Score: <strong>{location.score}/100</strong>
                  </p>
                </div>
                <strong>{location.priority}</strong>
              </div>

              <div className="recommendation-list">
                {recommendations.map((recommendation, index) => (
                  <p key={index}>{recommendation}</p>
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

export default AIRecommendations;
