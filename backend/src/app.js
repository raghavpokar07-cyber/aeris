const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const airRoutes = require("./routes/air");
const aiRoutes = require("./routes/ai");
const appRoutes = require("./routes/app");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(helmet({ frameguard: false, contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1200,
  standardHeaders: "draft-7",
  skip: (req) => req.path === "/api/health",
}));

app.get("/api/health", (_req, res) => {
  const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: database === "connected" ? "ok" : "degraded",
    service: "AERIS",
    database,
  });
});
app.use("/api/auth", authRoutes);
app.use("/api", airRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", appRoutes);
app.use(errorHandler);

module.exports = app;
