import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import { Connection } from "@/db/models/connection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const { userId } = await auth();
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { connectionId } = req.body;

  if (!connectionId) {
    return res.status(400).json({ message: "connectionId is required" });
  }

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return res.status(404).json({ message: "Request not found" });
  }

  
  if (connection.recipient.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Connection.deleteOne({ _id: connectionId });

  return res.status(200).json({ message: "Request rejected" });
}
