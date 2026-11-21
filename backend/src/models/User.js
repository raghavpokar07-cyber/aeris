const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, select: false },
  googleId: { type: String, unique: true, sparse: true },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  lifestyle: { type: String, default: "general" },
  locationPreferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  notificationSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  familyProfiles: { type: [mongoose.Schema.Types.Mixed], default: [] },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
