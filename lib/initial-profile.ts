import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { User } from "@/db/models/user";
import "@/lib/mongoose";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const profile = await User.findOne({
    userId: user.id,
  });

  if (profile) {
    return profile;
  }

  const newProfile = await User.create({
    userId: user.id,
    username: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.emailAddresses[0].emailAddress,
  });

  return newProfile;
};
