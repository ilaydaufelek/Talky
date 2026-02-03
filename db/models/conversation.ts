import mongoose, { Schema, models, model } from "mongoose";

const ConversationSchema = new Schema(
  {
    memberOneId: {
      type: String,
      required: true,
    },
    memberTwoId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ConversationSchema.index({ memberOneId: 1, memberTwoId: 1 }, { unique: true });

export const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);