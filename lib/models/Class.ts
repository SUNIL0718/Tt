import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  section: string;
  departmentId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true, // e.g. "Class 10"
    },
    section: {
      type: String,
      required: true, // e.g. "A"
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

// Compound index just like prisma: @@unique([organizationId, name, section])
classSchema.index({ organizationId: 1, name: 1, section: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && models.Class) {
  delete models.Class;
}

const Class = models.Class || model<IClass>("Class", classSchema);

export default Class;
