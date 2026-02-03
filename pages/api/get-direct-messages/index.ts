import { currentProfilePage } from "@/lib/current-profile-page";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";
import { Message } from "@/db/models/message";
import "@/lib/mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentProfilePage(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.query;

    if (!conversationId || typeof conversationId !== "string") {
      return res.status(400).json({ error: "Conversation ID missing or invalid" });
    }

    // ObjectId validasyonu
    const { isValidObjectId } = await import("mongoose");
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid Conversation ID" });
    }

    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("[DIRECT_MESSAGES_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
