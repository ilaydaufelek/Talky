import { connectDB } from "@/lib/mongoose";
import {User} from "@/db/models/user";

export async function GET() {
  await connectDB();

  const users=await User.create({
    userId:1,
    email:"ilaydaufelek",
    username:"ilayda"
  });

  return Response.json(users);
}
