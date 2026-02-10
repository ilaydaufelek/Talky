import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/db/models/user";
import { NextApiRequest } from "next";

export const currentProfilePage = async (req: NextApiRequest) => {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) return null;

  await connectDB();

  
  let user = await User.findOne({ clerkId });

  if (user) return user;

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkId);

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  const username =
    clerkUser.username ||
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    "user";

  user = await User.create({
    clerkId,
    email,
    username,
    imageUrl: clerkUser.imageUrl,
  });

  return user;
};
