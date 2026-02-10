import { Connection } from "@/db/models/connection";
import { currentProfilePage } from "@/lib/current-profile-page";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req:NextApiRequest,
    res:NextApiResponse
) {
    if(req.method !=="GET"){
      return  res.status(405).json({error:"Method not allowed"})
    }
try{
    const profile= await currentProfilePage(req)
    if(!profile){
        return res.status(401).json({ error: "Unauthorized" });
    }
  const incoming = await Connection.find({
  recipient: profile._id,
  accepted: false,
})
.populate("requester", "username")
.sort({ createdAt: -1 });

      res.status(200).json({incoming})
}
catch(error) {
    console.error("INCOMING_CONNECTIONS_ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}