const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const air = require("../services/airQuality");

const router = express.Router();
const locationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

router.get("/air-quality/search-location", async (req, res, next) => {
  try {
    const { q } = z.object({ q: z.string().trim().min(2).max(80) }).parse(req.query);
    res.json(await air.searchLocations(q));
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/air-quality/current", async (req, res, next) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    res.json(await air.current(lat, lon));
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/air-quality/map", async (req, res, next) => {
  try {
    const bounds = req.query.minLat != null ? {
      minLat: Number(req.query.minLat),
      maxLat: Number(req.query.maxLat),
      minLon: Number(req.query.minLon),
      maxLon: Number(req.query.maxLon),
    } : null;
    res.json(await air.mapLocations(bounds));
  } catch (error) { next(error); }
});

router.get("/air-quality/history", async (req, res, next) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    res.json(await air.history(lat, lon));
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/air-quality/forecast", async (req, res, next) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    res.json(await air.forecast(lat, lon));
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/air-quality/nearby", auth, async (req, res) => {
  const { lat, lon } = locationSchema.safeParse(req.query);
  res.json(lat ? { source: "Open-Meteo", stations: [], location: { lat, lon } } : { stations: [], source: "Open-Meteo" });
});

router.get("/air-quality/map-embed", async (_req, res) => {
  try {
    const upstream = await fetch("https://www.aqi.in/air-quality-map?map_type=aqi", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    let html = await upstream.text();
    html = html.replace("<head>", '<head><base href="https://www.aqi.in/">');
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error) {
    res.status(502).send("Could not load AQI map: " + error.message);
  }
});

router.get("/weather/current", async (req, res, next) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    res.json(await air.weather(lat, lon));
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

module.exports = router;
