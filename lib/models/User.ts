import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  hashedPassword?: string;
  name?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  organizationId?: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hashedPassword: {
      type: String,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"],
      default: "ADMIN",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", userSchema);

export default User;
