export function generateRecommendation({
  location,
  score,
  incidents,
  weatherCondition,
}) {
  const recommendations = [];

  if (score >= 80) {
    recommendations.push(
      `🚨 Critical risk at ${location}. Deploy 4 police officers immediately.`,
    );
  } else if (score >= 60) {
    recommendations.push(
      `⚠️ High risk at ${location}. Deploy 3 police officers.`,
    );
  } else if (score >= 40) {
    recommendations.push(
      `🟡 Moderate risk at ${location}. Maintain police monitoring.`,
    );
  } else {
    recommendations.push(
      `🟢 Low risk at ${location}. Normal monitoring is sufficient.`,
    );
  }

  if (incidents > 0) {
    recommendations.push(
      `🚨 ${incidents} recent incident(s) reported at this location.`,
    );
  }

  const weather = weatherCondition.toLowerCase();

  if (
    weather.includes("rain") ||
    weather.includes("drizzle") ||
    weather.includes("thunderstorm")
  ) {
    recommendations.push(
      "🌧️ Wet-weather conditions detected. Increase traffic monitoring and reduce vehicle speed.",
    );
  }

  if (
    weather.includes("fog") ||
    weather.includes("mist") ||
    weather.includes("haze")
  ) {
    recommendations.push(
      "🌫️ Reduced visibility detected. Deploy additional traffic control near intersections.",
    );
  }

  return recommendations;
}
