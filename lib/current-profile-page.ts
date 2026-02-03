import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/db/models/user";
import { NextApiRequest } from "next";

export const currentProfilePage = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

  if (!userId) return null;

  // MongoDB bağlantısı
  await connectDB();

  // Kullanıcı MongoDB'de var mı kontrol et
  let profile = await User.findOne({ userId });

  if (!profile) {
    // Clerk API ile user detaylarını al
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
const email = clerkUser.emailAddresses?.[0]?.emailAddress;

if (!email) {
  throw new Error("User has no email address");
}

const username =
  `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()
  || clerkUser.username
  || "User";

   try {
  profile = await User.create({
    userId,
    email,
    username,
    imageUrl: clerkUser.imageUrl,
  });
} catch (err) {
  console.error("USER CREATE ERROR:", err);
  throw err;
}
  }

  return profile;
};
