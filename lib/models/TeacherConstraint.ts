import mongoose, { Schema, model, models } from "mongoose";

const teacherConstraintSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    periodIndex: {
      type: Number, // If null, whole day unavailable
    },
    reason: {
      type: String,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

const TeacherConstraint =
  models.TeacherConstraint ||
  model("TeacherConstraint", teacherConstraintSchema);

export default TeacherConstraint;
