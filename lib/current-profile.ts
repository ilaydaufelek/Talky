import { User } from "@/db/models/user";
import { auth } from "@clerk/nextjs/server"
import { connectDB } from "./mongoose";

export const currentProfile = async () => {
    const { userId } = await auth();
    if (!userId) {
        return null
    }

    await connectDB();

    const profile = await User.findOne({ userId })
    console.log("Clerk userId:", userId);
    return profile;

}