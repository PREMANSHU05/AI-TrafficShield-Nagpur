export function calculateRisk({
  trafficDensity,
  accidentHistory,
  roadCondition,
  weatherRisk,
  nightRisk,
}) {
  const score =
    trafficDensity * 0.3 +
    accidentHistory * 0.25 +
    roadCondition * 0.15 +
    weatherRisk * 0.2 +
    nightRisk * 0.1;

  const finalScore = Math.round(score);
  let level;

  if (finalScore >= 70) {
    level = "High";
  } else if (finalScore >= 40) {
    level = "Medium";
  } else {
    level = "Low";
  }

  return {
    score: finalScore,
    level,
  };
}
