import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  email?: string;
  initials?: string;
  color?: string;
  maxPeriods: number;
  departmentId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const teacherSchema = new Schema<ITeacher>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    initials: {
      type: String, // For compact view
    },
    color: {
      type: String, // UI color coding
    },
    maxPeriods: {
      type: Number,
      default: 30, // Per week
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

// Force model rebuild in development to handle schema changes
if (process.env.NODE_ENV !== "production" && models.Teacher) {
  delete models.Teacher;
}

const Teacher = models.Teacher || model<ITeacher>("Teacher", teacherSchema);

export default Teacher;
