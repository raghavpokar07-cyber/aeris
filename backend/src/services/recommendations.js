function generate(aqi, weather, profile = {}) {
  const value = Number.isFinite(aqi) ? aqi : null;
  const severe = value != null && value > 200;
  const poor = value != null && value > 150;
  const elevated = value != null && value > 100;
  const result = [];

  if (severe) result.push({
    title: "Avoid outdoor activity",
    reason: "Current AQI is in the severe range.",
    benefit: "Reduces short-term pollutant exposure.",
    priority: "critical", time: "Now",
  });
  else if (poor) result.push({
    title: "Limit strenuous outdoor activity",
    reason: "Air quality is very poor.",
    benefit: "Lowers inhaled pollutant dose.",
    priority: "high", time: "Next 2-4 hours",
  });
  else if (elevated) result.push({
    title: "Prefer a lighter outdoor routine",
    reason: "Air quality may affect sensitive people.",
    benefit: "Balances activity with exposure reduction.",
    priority: "medium", time: "Choose the cleaner window",
  });
  else if (value != null) result.push({
    title: "Enjoy normal outdoor activity cautiously",
    reason: "Current AQI is lower.",
    benefit: "Supports healthy activity with normal precautions.",
    priority: "low", time: "Daytime",
  });

  result.push({
    title: "Keep windows closed during the polluted peak",
    reason: "Outdoor air may enter and affect indoor air.",
    benefit: "Limits infiltration from outside.",
    priority: elevated ? "high" : "medium", time: "During pollution peaks",
  });
  result.push({
    title: "Use public transport or combine trips",
    reason: "Fewer vehicle trips can reduce local emissions.",
    benefit: "Lower personal travel emissions where practical.",
    priority: "medium", time: "Next commute",
  });
  if (profile.familyProfiles?.some((p) => ["child", "elderly", "sensitive"].includes(String(p.category || "").toLowerCase()))) {
    result.unshift({
      title: "Protect vulnerable household members",
      reason: "A selected family profile may need lower exposure.",
      benefit: "Reduces avoidable time outdoors.",
      priority: "high", time: "Today",
    });
  }
  return result;
}

module.exports = { generate };
