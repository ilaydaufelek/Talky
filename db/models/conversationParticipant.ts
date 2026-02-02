import mongoose, { Schema, models, model } from "mongoose";

const ConversationParticipantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prisma'daki @@unique([userId, conversationId])
ConversationParticipantSchema.index(
  { userId: 1, conversationId: 1 },
  { unique: true }
);

export const ConversationParticipant =
  models.ConversationParticipant ||
  model("ConversationParticipant", ConversationParticipantSchema);
