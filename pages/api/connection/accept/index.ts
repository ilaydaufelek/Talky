import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import { Connection } from "@/db/models/connection";
import { currentProfilePage } from "@/lib/current-profile-page";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const user = await currentProfilePage(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = user._id.toString();

    const { connectionId } = req.body;
    if (!connectionId) {
      return res.status(400).json({ error: "connectionId is required" });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ error: "Request not found" });
    }


    if (connection.recipient.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (connection.accepted === true) {
      return res.status(400).json({ error: "Already accepted" });
    }

    connection.accepted = true;
    await connection.save();

    return res.status(200).json(connection);
  } catch (error) {
    console.error("ACCEPT CONNECTION ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
