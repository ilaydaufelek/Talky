import { currentProfilePage } from "@/lib/current-profile-page";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";
import { User } from "@/db/models/user";
import { Message } from "@/db/models/message";
import "@/lib/mongoose"; // DB connection (side-effect)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentProfilePage(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { content, fileType, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!conversationId || typeof conversationId !== "string") {
      return res.status(400).json({ error: "Conversation ID missing or invalid" });
    }

    const { isValidObjectId } = await import("mongoose");
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid Conversation ID" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }



    const message = await Message.create({
      content,
      fileType,
      fileUrl,
      senderId: user._id,
      conversationId,
    });

    // message.populate("sender"); // Frontend currently only uses senderId, preventing populate error

    const channelKey = `chat:${conversationId}:messages`;
    res.socket?.server.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.error("[DIRECT_MESSAGES_POST]", error);
    return res.status(500).json({
      error: "Internal Error",
      details: (error as any).message
    });
  }
}
