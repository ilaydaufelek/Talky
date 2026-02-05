import { Conversation } from "@/db/models/conversation";
import { connectDB } from "@/lib/mongoose";

export const getOrCreateConversation = async (
  memberIds: string[],
  name?: string
) => {
  await connectDB();

  const sortedMembers = [...new Set(memberIds)].sort();
  const isGroup = sortedMembers.length > 2;

  let conversation = await Conversation.findOne({
    isGroup,
    members: { $all: sortedMembers },
    $expr: { $eq: [{ $size: "$members" }, sortedMembers.length] },
  });

  if (conversation) return conversation;

  conversation = await Conversation.create({
    members: sortedMembers,
    isGroup,
    name: isGroup ? name : undefined,
    createdBy: sortedMembers[0],
  });

  return conversation;
};
