import mongoose, { Schema, model, models } from "mongoose";

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true, // "CLASSROOM", "LAB"
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

const Room = models.Room || model("Room", roomSchema);

export default Room;
