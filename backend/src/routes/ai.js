const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const ai = require("../services/ai");
const recommendations = require("../services/recommendations");
const air = require("../services/airQuality");
const { Conversation, Message } = require("../models/AppModels");

const router = express.Router();
router.use(auth);

const chatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().nullable().optional(),
  context: z.object({}).passthrough().optional(),
});

router.post("/chat", async (req, res, next) => {
  try {
    const data = chatSchema.parse(req.body);
    let conversationId = data.conversationId;
    if (!conversationId) {
      const conversation = await Conversation.create({
        userId: req.user.sub,
        title: data.message.slice(0, 80),
      });
      conversationId = conversation.id;
    } else {
      const owned = await Conversation.findOne({ _id: conversationId, userId: req.user.sub });
      if (!owned) return res.status(404).json({ error: "Conversation not found" });
    }
    await Message.create({
      conversationId,
      role: "user",
      content: data.message,
      contextMetadata: data.context || {},
    });
    const content = await ai.chat([{ role: "user", content: data.message }], data.context);
    await Message.create({
      conversationId,
      role: "assistant",
      content,
      contextMetadata: data.context || {},
    });
    res.json({ content, role: "assistant", conversationId });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.post("/recommendations", async (req, res, next) => {
  try {
    const { lat, lon, aqi, lifestyle, familyProfiles } = z.object({
      lat: z.number().optional(), lon: z.number().optional(), aqi: z.number().nullable().optional(),
      lifestyle: z.string().optional(), familyProfiles: z.array(z.any()).optional(),
    }).parse(req.body);
    res.json({ recommendations: recommendations.generate(aqi, null, { familyProfiles }) });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.post("/daily-plan", async (req, res, next) => {
  try {
    const data = z.object({
      lat: z.number().optional(), lon: z.number().optional(),
      aqi: z.number().nullable().optional(), lifestyle: z.string().optional(),
    }).parse(req.body);
    const items = recommendations.generate(data.aqi, null, {});
    res.json({
      date: new Date().toISOString().slice(0, 10),
      items: [
        { time: "07:00", title: "Check current air quality", reason: "Conditions can change through the day.", priority: "high" },
        ...items.map((item, i) => ({ time: ["08:30", "12:00", "17:00"][i % 3], ...item })),
        { time: "21:00", title: "Review progress and tomorrow", reason: "Use the day’s result to plan the next routine.", priority: "low" },
      ],
    });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.post("/explain-aqi", async (req, res, next) => {
  try {
    const { aqi } = z.object({ aqi: z.number().nullable() }).parse(req.body);
    const items = recommendations.generate(aqi, null, {});
    res.json({ summary: aqi == null ? "Live air-quality data is unavailable." : `${aqi} AQI: use the listed precautions and check live conditions.`, recommendations: items });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

module.exports = router;
