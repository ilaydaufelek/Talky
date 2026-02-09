import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
   clerkId: {         
    type: String,
    required: true,
    unique: true,
  },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    inviteOpen:{
      type:Boolean,
      default:true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const User = models.User || model("User", UserSchema); 
