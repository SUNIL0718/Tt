import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code?: string;
  type: "THEORY" | "LAB";
  departmentId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    type: {
      type: String,
      required: true, // "THEORY", "LAB"
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && models.Subject) {
  delete models.Subject;
}

const Subject = models.Subject || model<ISubject>("Subject", subjectSchema);

export default Subject;
