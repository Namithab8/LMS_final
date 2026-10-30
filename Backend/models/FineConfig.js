// Backend/models/FineConfig.js
import mongoose from "mongoose";

const fineConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "MinuteTest"
    finePerDay: { type: Number, required: true },         // used as per-minute rate in testing
    graceDays: { type: Number, default: 0 },              // not used for minutes test
    maxFinePerItem: { type: Number },                     // optional cap
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FineConfig = mongoose.model("FineConfig", fineConfigSchema);
export default FineConfig;
