import { Conversation } from "@/db/models/conversation";
import { connectDB } from "@/lib/mongoose";

export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
    await connectDB();

    let conversation = await Conversation.findOne({
        $or: [
            { memberOneId: memberOneId, memberTwoId: memberTwoId },
            { memberOneId: memberTwoId, memberTwoId: memberOneId },
        ],
    });

    if (!conversation) {
        conversation = await Conversation.create({
            memberOneId,
            memberTwoId,
        });
    }

    return conversation;
};
