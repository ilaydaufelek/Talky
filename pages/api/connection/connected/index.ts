import { Connection } from "@/db/models/connection";
import { currentProfilePage } from "@/lib/current-profile-page";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {
    const profile = await currentProfilePage(req)
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const connected = await Connection.find({
      accepted: true,
      $or: [{ requester: profile._id }, { recipient: profile._id }],
    }).populate("requester recipient");
    const connectedUsers = connected.map((conn) => {
      if (conn.requester._id.toString() === profile._id.toString()) {
        return conn.recipient;
      } else {
        return conn.requester;
      }
    });
    return res.status(200).json(connectedUsers);
  } catch (error) {
    console.error("CONNECTED ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}