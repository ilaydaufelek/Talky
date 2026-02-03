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

        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({ error: "Member ID missing" });
        }

        const conversation = await getOrCreateConversation(
            profile.userId,
            memberId
        );

        return res.status(200).json(conversation);
    } catch (error) {
        console.error("[CONVERSATIONS_POST]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}
