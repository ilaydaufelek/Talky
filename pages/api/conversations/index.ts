import { currentProfilePage } from "@/lib/current-profile-page";
import { getOrCreateConversation } from "@/lib/conversation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePage(req);
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { memberIds, name } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "At least one member required" });
    }

    const allMembers = Array.from(
      new Set([profile.userId, ...memberIds])
    );
    if (allMembers.length < 2) {
      return res.status(400).json({
        error: "You must select another user to start a conversation",
      });
    }

    if (memberIds.includes(profile.userId)) {
      return res.status(400).json({ error: "Cannot start conversation with yourself" });
    }

    const conversation = await getOrCreateConversation(
      allMembers,
      name
    );

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("[CONVERSATIONS_POST]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
