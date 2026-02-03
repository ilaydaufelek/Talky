// pages/api/current-user/index.ts
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/db/models/user";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req); // pages router için doğru kullanım

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        await connectDB(); // DB bağlantısı

        const profile = await User.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(profile);
    } catch (error) {
        console.error("Current-user API error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            details: (error as any).message,
        });
    }
}
