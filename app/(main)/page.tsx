'use client'
import axios from "axios";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message={
    _id:string;
    content:string;
    senderId:string;
}


const MainPage=()=>{
     const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<{ userId: string; username: string }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(()=>{
  axios.get('/api/current-user').then((res)=>{
    setCurrentUserId(res.data._id)
  });
  },[]);
   useEffect(() => {
    axios.get("/api/users").then((res) => {
      setUsers(res.data);
      if (res.data.length > 0) {
        startConversation(res.data[0].userId);
      }
    });
  }, []);

  useEffect(()=>{
    if(!conversationId) return;
    const socketInstance=io({
        path:'/api/socket/io',
        addTrailingSlash:false
    })
    setSocket(socketInstance)
    socketInstance.on("connect",()=>{
        console.log("socket connect:",socketInstance.id);
    });
        socketInstance.on(`chat:${conversationId}:messages`, (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketInstance.disconnect();
    };

  },[conversationId])

  useEffect(()=>{
 if(!conversationId) return
 const getMessages=async()=>{
    try{
        const response= await axios.get("/api/get-direct-messages",{params:{conversationId}})
        setMessages(response.data);

    }
    catch (error){
         console.log("Error fetching messages:", error);
    }
 }
 getMessages();
  },[conversationId])

  
   const startConversation = async (memberId: string) => {
    try {
      const response = await axios.post("/api/conversations", { memberId });
      setConversationId(response.data._id);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!value.trim() || !conversationId) return;

    try {
      await axios.post(
        "/api/socket/direct-messages",
        {
          content: value,
          fileUrl: null,
          fileType: null,
        },
        {
          params: { conversationId },
        }
      );
      setValue("");
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data || error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-black font-sans">
      <div className="flex flex-col w-105 h-155 border border-zinc-700/50 rounded-xl bg-white dark:bg-zinc-900 shadow-lg">

        {/* HEADER */}
        <div className="h-12 border-b border-zinc-700/40 flex items-center px-4 text-sm font-medium">

        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
          {messages.map((msg) => {
            const currentUser = msg.senderId === currentUserId;
            return (
              <div
                key={msg._id}
                className={`flex ${currentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
            max-w-[75%] px-3 py-2 rounded-xl
            ${currentUser
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-zinc-200 dark:bg-zinc-800 rounded-bl-none"}
          `}
                >
                  {msg.content}
                </div>
              </div>

            )
          })}
        </div>

        {/* INPUT */}
        <div className="border-t border-zinc-700/40 p-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Mesaj yaz..."
            className="w-full h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>
    </div>
  );
}

   
export default MainPage