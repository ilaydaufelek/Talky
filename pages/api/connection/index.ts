import { Connection } from "@/db/models/connection";
import { User } from "@/db/models/user";

import { currentProfilePage } from "@/lib/current-profile-page";
import { NextApiRequest, NextApiResponse } from "next";

export  default async function handler(
    req:NextApiRequest,
    res:NextApiResponse
) {
    if(req.method !=="POST"){
        return res.status(405).json({error:"Method not  allowed"})
    }
    try{
       const profile= await currentProfilePage(req)
        if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const{username}=req.body;
    
    const targetUser= await User.findOne({username})
if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
     if (profile._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({ error: "You cannot invite yourself" });
    }
     const existingConnection = await Connection.findOne({
      $or: [
    { requester: profile._id, recipient: targetUser._id },
    { requester: targetUser._id, recipient: profile._id },
  ],
    });

    if (existingConnection) {
      return res.status(400).json({
        error: "Friend request already sent",
      });
    }
    const connection= await Connection.create({
      requester: profile._id,
      recipient: targetUser._id,
      accepted: false,
    })
       return res.status(201).json(connection);
    }
    catch(error){
        console.error("INVITE_ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
    }
}