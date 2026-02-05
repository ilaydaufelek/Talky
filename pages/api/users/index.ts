import { currentProfilePage } from "@/lib/current-profile-page";
import { User } from "@/db/models/user";
import { connectDB } from "@/lib/mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const profile = await currentProfilePage(req);
        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await connectDB();

        const users = await User.find({
            _id: { $ne: profile._id }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error("[USERS_GET]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}
