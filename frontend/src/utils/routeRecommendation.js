const alternateRoutes = {
  Sitabuldi: {
    blocked: "Sitabuldi Main Road",
    alternate: "Wardha Road → Civil Lines",
    reason: "High traffic and accident risk",
  },
  Sadar: {
    blocked: "Sadar Main Road",
    alternate: "Katol Road → Seminary Hills",
    reason: "High congestion",
  },
  Hingna: {
    blocked: "Hingna Road",
    alternate: "Amravati Road → Wadi",
    reason: "Accident risk",
  },
  "Manish Nagar": {
    blocked: "Manish Nagar Main Road",
    alternate: "Wardha Road",
    reason: "Traffic congestion",
  },
  Manewada: {
    blocked: "Manewada Road",
    alternate: "Ring Road",
    reason: "High traffic density",
  },
};

export function getAlternateRoute(location, score) {
  if (score < 60) {
    return null;
  }

  return (
    alternateRoutes[location] || {
      blocked: `${location} Main Road`,
      alternate: "Use nearest alternate route",
      reason: "High traffic risk",
    }
  );
}
