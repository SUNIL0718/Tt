import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  type?: string;
  domain?: string;
  logoUrl?: string;
  address?: string;
  subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  subscriptionPlan: string;
  razorpaySubId?: string;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String, // "School", "College", "Coaching"
    },
    domain: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
    address: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "PAST_DUE", "CANCELED", "UNPAID"],
      default: "ACTIVE",
    },
    subscriptionPlan: {
      type: String,
      default: "FREE",
    },
    razorpaySubId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Organization =
  models.Organization || model<IOrganization>("Organization", organizationSchema);

export default Organization;
