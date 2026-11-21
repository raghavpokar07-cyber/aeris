require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const port = Number(process.env.PORT || 4000);

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is required");
  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("MongoDB Atlas connected"))
    .catch((error) => console.warn(`MongoDB unavailable: ${error.message}`));
  app.listen(port, "0.0.0.0", () => console.log(`AERIS backend listening on port ${port}`));
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
