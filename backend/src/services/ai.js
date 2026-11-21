async function chat(messages, context) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const aqi = context?.aqi;
    const guidance = aqi == null
      ? "Live air-quality data is unavailable, so check a trusted local source before extended outdoor activity."
      : aqi > 200
        ? "AQI is severe. Stay indoors, keep windows closed, and reduce exposure. Seek professional medical help for serious symptoms."
        : aqi > 150
          ? "AQI is very poor. Avoid strenuous outdoor activity and consider an appropriate filter indoors."
          : aqi > 100
            ? "AQI is elevated. Sensitive people should reduce prolonged or strenuous outdoor exposure."
            : "AQI is in a lower range, but continue checking live conditions and use normal precautions.";
    return `${guidance}\n\nConfigure AI_API_KEY for a conversational, fully personalized response.`;
  }

  const system = `You are AERIS, an environmental air-quality assistant. Use this context first:
${JSON.stringify(context || {})}
Explain clearly, prioritize exposure reduction, and never present yourself as a medical professional. For serious symptoms, advise contacting a healthcare professional or emergency service.`;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "openai/gpt-4o-mini",
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!response.ok) throw Object.assign(new Error("AI provider is temporarily unavailable"), { status: 502 });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I could not generate a response.";
}

module.exports = { chat };
