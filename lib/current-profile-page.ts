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

    profile = await User.create({
      userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      username: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
    });
  }

  return profile;
};
