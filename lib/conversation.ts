import { Conversation } from "@/db/models/conversation";
import { connectDB } from "@/lib/mongoose";

export const getOrCreateConversation = async (
  memberIds: string[],
  name?: string
) => {
  await connectDB();

  const isGroup = memberIds.length > 2;
  const sortedMembers = [...new Set(memberIds)].sort();
console.log("MEMBERS:", sortedMembers);
  // 1️⃣ Önce kesin bul
  let conversation = await Conversation.findOne({
    isGroup,
    members: {
      $all: sortedMembers,
      $size: sortedMembers.length,
    },
  });
if (!memberIds.every(id => typeof id === "string" && id.length === 24)) {
  throw new Error("Conversation members must be Mongo ObjectId strings");
}
  if (conversation) return conversation;

  // 2️⃣ Yoksa oluşturmaya çalış
  try {
    return await Conversation.create({
      members: sortedMembers,
      isGroup,
      name,
      createdBy: sortedMembers[0],
    });

    
  } catch (error: any) {
    // 3️⃣ Duplicate olduysa TEKRAR BUL (null dönemez artık)
    if (error.code === 11000) {
      const existing = await Conversation.findOne({
        isGroup,
        members: {
          $all: sortedMembers,
          $size: sortedMembers.length,
        },
      });

      if (!existing) {
        throw new Error("Conversation exists but could not be found");
      }

      return existing;
    }

    throw error;
  }
};
