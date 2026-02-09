import mongoose, { Schema, models, model } from "mongoose";

const ConnectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


ConnectionSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);

export const Connection =
  models.Connection || model("Connection", ConnectionSchema);
