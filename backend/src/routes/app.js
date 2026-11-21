const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { Conversation, Message, DailyPlan, SavedLocation, ImpactRecord } = require("../models/AppModels");
const recommendations = require("../services/recommendations");

const router = express.Router();
router.use(auth);
const indoorChecklist = [
  "Close windows during pollution peaks",
  "Use kitchen extraction while cooking",
  "Replace the purifier filter on schedule",
  "Clean dust from frequently used surfaces",
  "Avoid indoor smoking and incense",
  "Ventilate during a cleaner outdoor window",
];
const indoorActionsSchema = z.object({
  completedActions: z.array(z.string().min(1).max(100))
    .max(indoorChecklist.length)
    .refine((actions) => actions.every((action) => indoorChecklist.includes(action)) && new Set(actions).size === actions.length),
});

router.get("/profile", async (req, res) => {
  const user = await User.findById(req.user.sub);
  res.json({ lifestyle: user?.lifestyle, preferences: user?.preferences, locationPreferences: user?.locationPreferences, notificationSettings: user?.notificationSettings, familyProfiles: user?.familyProfiles });
});

router.patch("/profile", async (req, res, next) => {
  try {
    const data = z.object({
      lifestyle: z.string().optional(), preferences: z.any().optional(),
      locationPreferences: z.any().optional(), notificationSettings: z.any().optional(),
      familyProfiles: z.array(z.any()).optional(),
    }).parse(req.body);
    const user = await User.findByIdAndUpdate(req.user.sub, data, { new: true, runValidators: true });
    res.json({ lifestyle: user.lifestyle, preferences: user.preferences, locationPreferences: user.locationPreferences, notificationSettings: user.notificationSettings, familyProfiles: user.familyProfiles });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/conversations", async (req, res) => {
  res.json(await Conversation.find({ userId: req.user.sub }).sort({ updatedAt: -1 }).limit(50));
});
router.post("/conversations", async (req, res) => {
  const conversation = await Conversation.create({ userId: req.user.sub, title: req.body.title || "Air quality conversation" });
  res.status(201).json(conversation);
});
router.get("/conversations/:id", async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.sub });
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  const messages = await Message.find({ conversationId: conversation.id }).sort({ createdAt: 1 });
  res.json({ conversation, messages });
});
router.delete("/conversations/:id", async (req, res) => {
  await Message.deleteMany({ conversationId: req.params.id });
  await Conversation.deleteOne({ _id: req.params.id, userId: req.user.sub });
  res.json({ ok: true });
});

router.get("/plans/today", async (req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  const plan = await DailyPlan.findOne({ userId: req.user.sub, date });
  res.json(plan || { date, recommendations: [], completedActions: [], indoorActions: [], generatedAt: null });
});
router.patch("/plans/today/indoor-actions", async (req, res, next) => {
  try {
    const { completedActions } = indoorActionsSchema.parse(req.body);
    const date = new Date().toISOString().slice(0, 10);
    const plan = await DailyPlan.findOneAndUpdate(
      { userId: req.user.sub, date },
      { $set: { indoorActions: completedActions } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json(plan);
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});
router.post("/plans/generate", async (req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  const items = recommendations.generate(req.body.aqi, null, req.body.profile);
  const plan = await DailyPlan.findOneAndUpdate(
    { userId: req.user.sub, date },
    { $set: { recommendations: items, generatedAt: new Date() } },
    { upsert: true, new: true },
  );
  res.json(plan);
});
router.patch("/plans/:id/actions", async (req, res) => {
  const plan = await DailyPlan.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.sub },
    { $set: { completedActions: z.array(z.string()).parse(req.body.completedActions) } },
    { new: true },
  );
  if (!plan) return res.status(404).json({ error: "Plan not found" });
  res.json(plan);
});

router.get("/locations", async (req, res) => res.json(await SavedLocation.find({ userId: req.user.sub }).sort({ createdAt: -1 })));
router.post("/locations", async (req, res, next) => {
  try {
    const data = z.object({ locationName: z.string().min(1), coordinates: z.object({ lat: z.number(), lon: z.number() }).optional(), type: z.string().optional() }).parse(req.body);
    res.status(201).json(await SavedLocation.create({ userId: req.user.sub, ...data }));
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});
router.delete("/locations/:id", async (req, res) => {
  await SavedLocation.deleteOne({ _id: req.params.id, userId: req.user.sub });
  res.json({ ok: true });
});

router.get("/impact/summary", async (req, res) => {
  const records = await ImpactRecord.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(500);
  const total = records.reduce((sum, r) => sum + r.estimatedImpact, 0);
  const date = new Date().toISOString().slice(0, 10);
  const todayPlan = await DailyPlan.findOne({ userId: req.user.sub, date });
  const completedIndoorActions = todayPlan?.indoorActions?.length || 0;
  const completedPlanActions = todayPlan?.completedActions?.length || 0;
  res.json({
    estimatedCo2Kg: Number(total.toFixed(3)),
    actionsCompleted: records.length,
    records,
    dailyProgress: {
      date,
      indoorActionsCompleted: completedIndoorActions,
      indoorActionsTotal: indoorChecklist.length,
      homeProtectionScore: Math.round(completedIndoorActions / indoorChecklist.length * 100),
      planActionsCompleted: completedPlanActions,
      planActionsTotal: todayPlan?.recommendations?.length || 0,
    },
  });
});
router.post("/impact/actions", async (req, res, next) => {
  try {
    const data = z.object({ actionType: z.string().min(1), estimatedImpact: z.number().nonnegative(), calculationMetadata: z.any().optional() }).parse(req.body);
    await ImpactRecord.create({ userId: req.user.sub, ...data });
    const records = await ImpactRecord.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(500);
    const estimatedCo2Kg = records.reduce((sum, record) => sum + record.estimatedImpact, 0);
    res.status(201).json({
      estimatedCo2Kg: Number(estimatedCo2Kg.toFixed(3)),
      actionsCompleted: records.length,
    });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/notifications/preferences", async (req, res) => {
  const user = await User.findById(req.user.sub);
  res.json(user?.notificationSettings || {});
});
router.patch("/notifications/preferences", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.sub, { notificationSettings: req.body }, { new: true });
  res.json(user.notificationSettings);
});

module.exports = router;
