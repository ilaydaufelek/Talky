import mongoose, { Schema, models, model, Types } from "mongoose";

const ConversationSchema = new Schema(
  {
    members: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: true,
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    name: String,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);
