export function getDeploymentRecommendation(score) {
  if (score >= 80) {
    return {
      priority: "Critical",
      officers: 4,
      recommendation: "Immediate police deployment required",
    };
  }

  if (score >= 60) {
    return {
      priority: "High",
      officers: 3,
      recommendation: "Deploy additional police personnel",
    };
  }

  if (score >= 40) {
    return {
      priority: "Medium",
      officers: 2,
      recommendation: "Maintain regular police presence",
    };
  }

  return {
    priority: "Low",
    officers: 1,
    recommendation: "Routine monitoring recommended",
  };
}
