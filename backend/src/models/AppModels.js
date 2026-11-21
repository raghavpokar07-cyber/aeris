const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversation = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, default: "Air quality conversation" },
}, { timestamps: true });

const message = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  contextMetadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const dailyPlan = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true, index: true },
  recommendations: { type: [Schema.Types.Mixed], default: [] },
  completedActions: { type: [String], default: [] },
  indoorActions: { type: [String], default: [] },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
dailyPlan.index({ userId: 1, date: 1 }, { unique: true });

const savedLocation = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  locationName: { type: String, required: true },
  coordinates: { lat: Number, lon: Number },
  type: { type: String, default: "saved" },
}, { timestamps: true });

const impactRecord = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actionType: { type: String, required: true },
  calculationMetadata: { type: Schema.Types.Mixed, default: {} },
  estimatedImpact: { type: Number, required: true },
}, { timestamps: true });

module.exports = {
  Conversation: mongoose.model("Conversation", conversation),
  Message: mongoose.model("Message", message),
  DailyPlan: mongoose.model("DailyPlan", dailyPlan),
  SavedLocation: mongoose.model("SavedLocation", savedLocation),
  ImpactRecord: mongoose.model("ImpactRecord", impactRecord),
};
