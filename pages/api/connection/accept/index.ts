import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import { Connection } from "@/db/models/connection";



export async function POST(req: Request) {
  await connectDB();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { connectionId } = await req.json();

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return NextResponse.json({ message: "Request not found" }, { status: 404 });
  }

  
  if (connection.recipient.toString() !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (connection.accepted === true) {
    return NextResponse.json(
      { message: "Already accepted" },
      { status: 400 }
    );
  }

  connection.accepted = true;
  await connection.save();

  return NextResponse.json(connection);
}
