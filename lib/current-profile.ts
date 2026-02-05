import { User } from "@/db/models/user";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "./mongoose";

export const currentProfile = async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  await connectDB();

  // 1️⃣ Mongo’da var mı?
  let user = await User.findOne({ clerkId });
  if (user) return user;

  // 2️⃣ Yoksa Clerk’ten çek → Mongo’ya yaz
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkId);

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) throw new Error("User has no email");

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
