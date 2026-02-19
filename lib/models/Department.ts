import mongoose, { Schema, model, models } from "mongoose";

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
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

const Department = models.Department || model("Department", departmentSchema);

export default Department;
