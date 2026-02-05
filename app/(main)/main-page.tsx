'use client';

export const dynamic = "force-dynamic";
import {   useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter, useSearchParams } from "next/navigation";
import { ModeToggle } from "@/components/theme";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

/* ---------------- TYPES ---------------- */
type Message = {
  _id: string;
  content: string;
  senderId: string;
  createdAt?: string;
};

type User = {
  _id: string;
  username: string;
};



const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const[selected,setSelected]=useState<"contacts" | "groups">('contacts')
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
    
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>("");

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  /* ---------------- CURRENT USER ID ---------------- */
  useEffect(() => {
    axios.get("/api/current-user").then(res => {
      setCurrentUserId(res.data._id);
    });
  }, []);

  

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const id = searchParams?.get("conversationId");
    if (id) setConversationId(id);
  }, [searchParams]);

  /* ---------------- USERS ---------------- */
  useEffect(() => {
    axios.get("/api/users").then(res => {
      setUsers(res.data);
    });
  }, []);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    const s = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    setSocket(s);

    s.on(`chat:${conversationId}:messages`, (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, [conversationId]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    axios
      .get("/api/get-direct-messages", { params: { conversationId } })
      .then(res => setMessages(res.data));
  }, [conversationId]);
 
  /* ---------------- START CHAT ---------------- */
  const startConversation = async (memberIds: string[], chatName: string) => {
    const res = await axios.post("/api/conversations", { memberIds });

    const id = res.data._id;
    setConversationId(id);
    setActiveChatName(chatName);
    setMessages([]);

    router.push(`/?conversationId=${id}`);
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!value.trim() || !conversationId) return;

    await axios.post(
      "/api/socket/direct-messages",
      { content: value },
      { params: { conversationId } }
    );

    setValue("");
  };

  const{user}=useUser()
        return (
      
       <ResizablePanelGroup
      orientation="horizontal"
      className=" bg-zinc-100 dark:bg-black">
      <ResizablePanel  defaultSize="20%" maxSize="30%" minSize="15%">
        <div className="flex h-full flex-col p-4 ">
        <div className="flex items-center gap-5 w-full min-w-0 ">
           <img
    className="w-5 h-5 rounded-full shrink-0"
    src={user?.imageUrl}
    alt=""
  />
  <span className="font-semibold truncate">
   {user?.fullName}
  </span>
   </div>
   <div className="w-full h-px bg-zinc-700/20 dark:bg-zinc-200/25 mt-4 " />
    <div className="flex items-center justify-center mt-4" >
      <ButtonGroup  >
        <Button className={`relative cursor-pointer  ${
      selected === "contacts"
        ? "border-b-2 border-black dark:border-white"
        : "border-b-2 border-transparent"
    }`} onClick={()=>setSelected("contacts")}  variant="ghost">Contacts</Button>
        <Button 
        className={`relative cursor-pointer  ${
      selected === "groups"
        ? "border-b-2 border-black dark:border-white"
        : "border-b-2 border-transparent"
    }`}
     onClick={()=>setSelected("groups")}  variant="ghost">Groups</Button>
     </ButtonGroup>
          <Button size="icon" variant="outline" className="bg-transparent rounded-full cursor-pointer " >+</Button>
    </div>
       {selected==="contacts" &&(
        <div  className="p-4 space-y-2 " >
          {users?.map((u)=>(
            <div onClick={() =>
      startConversation(
        [currentUserId!, u._id],
        u.username
      )
    } className="font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700/30 p-1 hover:rounded-md cursor-pointer " key={u._id} >{u.username}</div>
          )
            
          )}
        </div>
       )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="relative" defaultSize="75%">
        <div className="flex  flex-1 h-full flex-col p-2 ">
         {!conversationId &&(
          <div className="absolute top-0  h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]"></div>
         )}
         {conversationId &&(
         <>
          <div className="h-12 border-b  border-zinc-700/20 dark:border-zinc-200/25 font-semibold flex items-center  " >
           <span className="ml-2" > {activeChatName}</span>
          </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] px-3 py-2 rounded-xl text-sm
                        ${isMe
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-zinc-200 dark:bg-zinc-800 rounded-bl-none"}
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
            
              <Input
              className="p-4"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Mesaj yaz..."
                
              />
        
         </>
          
         )}
        </div>
        
      </ResizablePanel>
    </ResizablePanelGroup>
           
       
        );
};

export default MainPage;
