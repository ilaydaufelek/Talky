import mongoose, { Schema, models, model } from "mongoose";

const ConversationSchema = new Schema(
  {
    members: {
      type: [String], // userId'ler
      required: true,
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String, // grup adı
    },

    createdBy: {
      type: String, // grup kurucusu
    },
  },
  {
    timestamps: true,
  }
);

// DM'ler için aynı iki kişi tekrar konuşma açamasın
ConversationSchema.index(
  { members: 1 },
  { unique: true, partialFilterExpression: { isGroup: false } }
);

export const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);
