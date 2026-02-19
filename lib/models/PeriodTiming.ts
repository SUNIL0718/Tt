import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITimingSlot {
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

export interface IPeriodTiming extends Document {
  name: string;
  slots: ITimingSlot[];
  organizationId: mongoose.Types.ObjectId;
  isDefault: boolean;
}

const periodTimingSchema = new Schema<IPeriodTiming>(
  {
    name: {
      type: String, // e.g., "Regular Schedule", "Friday Schedule"
      required: true,
    },
    slots: [
      {
        label: { type: String, required: true }, // e.g., "Period 1", "Recess", "Assembly"
        startTime: { type: String, required: true }, // "08:00"
        endTime: { type: String, required: true }, // "08:45"
        isBreak: { type: Boolean, default: false },
      }
    ],
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const PeriodTiming = models.PeriodTiming || model<IPeriodTiming>("PeriodTiming", periodTimingSchema);

export default PeriodTiming;
