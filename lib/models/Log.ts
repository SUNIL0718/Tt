import mongoose, { Schema, model, models } from "mongoose";

const logSchema = new Schema(
  {
    level: {
      type: String,
      enum: ["INFO", "WARNING", "ERROR", "CRITICAL"],
      default: "INFO",
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true, // e.g., "AUTH", "DATABASE", "USER_ACTION"
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Log = models.Log || model("Log", logSchema);

export default Log;
