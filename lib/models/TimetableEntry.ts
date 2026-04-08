import mongoose, { Schema, model, models } from "mongoose";

const timetableEntrySchema = new Schema(
  {
    timetableId: {
      type: Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    day: {
      type: String, // "MONDAY", "TUESDAY"...
      required: true,
    },
    periodIndex: {
      type: Number, // 1-based index
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject", // Nullable for free periods
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    message: {
      type: String, // Custom note
    },
    type: {
      type: String,
      enum: ["THEORY", "LAB"],
      default: "THEORY",
    },
  },
  { timestamps: true }
);

const TimetableEntry =
  models.TimetableEntry || model("TimetableEntry", timetableEntrySchema);

export default TimetableEntry;
