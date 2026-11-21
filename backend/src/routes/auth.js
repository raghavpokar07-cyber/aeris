const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { z } = require("zod");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
const googleClient = new OAuth2Client();
const credentialsSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
const googleCredentialSchema = z.object({
  credential: z.string().min(1).max(8192),
});

function tokenFor(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.get("/google/config", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || null;
  res.json({ enabled: Boolean(clientId), clientId });
});

router.post("/google", async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) return res.status(503).json({ error: "Google sign-in is not configured" });
    const { credential } = googleCredentialSchema.parse(req.body);
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch (error) {
      if (/fetch|network|timeout/i.test(error.message)) return next(Object.assign(error, { status: 502 }));
      return res.status(401).json({ error: "Google credential is invalid or expired" });
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({ error: "A verified Google account is required" });
    }
    const email = payload.email.trim().toLowerCase();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        if (user.googleId && user.googleId !== payload.sub) {
          return res.status(409).json({ error: "This email is connected to another Google account" });
        }
        user.googleId = payload.sub;
        await user.save();
      } else {
        try {
          user = await User.create({
            name: String(payload.name || "").trim().slice(0, 80) || email.split("@")[0].slice(0, 80),
            email,
            googleId: payload.sub,
          });
        } catch (error) {
          if (error.code !== 11000) throw error;
          user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });
          if (!user) throw error;
          if (user.googleId && user.googleId !== payload.sub) {
            return res.status(409).json({ error: "This email is connected to another Google account" });
          }
          if (!user.googleId) {
            user.googleId = payload.sub;
            await user.save();
          }
        }
      }
    }

    res.json({
      token: tokenFor(user),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const data = credentialsSchema.refine((v) => req.path === "/login" || v.name).parse(req.body);
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email is already registered" });
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 12),
    });
    res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error.status ? error : Object.assign(error, { status: error.name === "ZodError" ? 400 : 500 })); }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = credentialsSchema.parse({ ...req.body, name: "Login" });
    const user = await User.findOne({ email: data.email.toLowerCase() }).select("+passwordHash");
    if (!user?.passwordHash || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error.name === "ZodError" ? Object.assign(error, { status: 400 }) : error); }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email, preferences: user.preferences, lifestyle: user.lifestyle, locationPreferences: user.locationPreferences, notificationSettings: user.notificationSettings, familyProfiles: user.familyProfiles });
  } catch (error) { next(error); }
});

router.post("/logout", auth, (_req, res) => res.json({ ok: true }));

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordResetTokenHash");
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
      user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      if (process.env.NODE_ENV !== "production") console.info(`Development password reset token: ${token}`);
    }
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: "Invalid email" });
  }
  res.json({ ok: true, message: "If the account exists, reset instructions will be sent." });
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const data = z.object({
      token: z.string().min(32),
      password: z.string().min(8).max(128),
    }).parse(req.body);
    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");
    if (!user) return res.status(400).json({ error: "Reset token is invalid or expired" });
    user.passwordHash = await bcrypt.hash(data.password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    res.json({ ok: true, message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: "Invalid reset request" });
    next(error);
  }
});

module.exports = router;
