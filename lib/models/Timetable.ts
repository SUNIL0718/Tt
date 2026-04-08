import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITimetable extends Document {
  name: string;
  isPublished: boolean;
  year: number;
  organizationId: mongoose.Types.ObjectId;
}

const timetableSchema = new Schema<ITimetable>(
  {
    name: {
      type: String,
      required: true, // e.g. "Draft 1 - Summer Term"
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    year: {
      type: Number,
      required: true, // 2024
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

const Timetable = models.Timetable || model<ITimetable>("Timetable", timetableSchema);

export default Timetable;
