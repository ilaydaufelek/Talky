import mongoose, { Schema, models, model } from "mongoose";

const ConversationSchema = new Schema(
  {},
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);