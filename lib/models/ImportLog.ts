import mongoose, { Schema, model, models } from "mongoose";

const importLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entityType: {
      type: String,
      required: true, // "TEACHER", "CLASS", "SUBJECT", "ROOM"
    },
    fileName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "PARTIAL"],
      default: "PENDING",
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    errors: [
      {
        row: Number,
        message: String,
        data: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

const ImportLog = models.ImportLog || model("ImportLog", importLogSchema);

export default ImportLog;
