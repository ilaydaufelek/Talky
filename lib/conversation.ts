import { Conversation } from "@/db/models/conversation";
import { connectDB } from "@/lib/mongoose";

export const getOrCreateConversation = async (
  memberIds: string[],
  name?: string
) => {
  await connectDB();

  const isGroup = memberIds.length > 2;

  // members sırasını sabitle (unique index için)
  const sortedMembers = [...memberIds].sort();

  let conversation = await Conversation.findOne({
    isGroup,
    members: {
      $all: sortedMembers,
      $size: sortedMembers.length,
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: sortedMembers,
      isGroup,
      name,
      createdBy: sortedMembers[0], // istersen profile.userId ver
    });
  }

  return conversation;
};
