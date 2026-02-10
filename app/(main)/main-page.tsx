'use client';

export const dynamic = "force-dynamic";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter, useSearchParams } from "next/navigation";
import { ModeToggle } from "@/components/theme";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ban, Check } from "lucide-react";

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
type Connection = {
  _id: string;
  username: string;


}
type GetRequest = {
  _id: string;
  requester: {
    _id: string;
    username: string;
  };
}

const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<"contacts" | "groups">('contacts')
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selected2, setSelected2] = useState<"request" | "add">('request')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>("");
  const [getRequest, setGetRequest] = useState<GetRequest[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [connection, setConnection] = useState<Connection[]>([])
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
  useEffect(() => {
    axios.get("/api/connection/connected").then(res => {
      setConnection(res.data);
    });
  }, []);

  const sendFriendsRequest = async (username: string) => {
    await axios.post("/api/connection", { username })
  }
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

  const acceptRequest = async (connectionId: string) => {
    try {
      await axios.post("/api/connection/accept", { connectionId });
      setGetRequest((prev) => prev.filter((r) => r._id !== connectionId));
      const res = await axios.get("/api/connection/connected");
      setConnection(res.data);
    } catch (error) {
      console.error("Accept error", error);
    }
  };

  const deleteRequest = async (connectionId: string) => {
    await axios.post("/api/connection/reject", { connectionId })
    setGetRequest(prev => prev.filter((r) => r._id !== connectionId))
  }



  useEffect(() => {
    axios.get("/api/connection/incoming").then((res) => {
      console.log("INCOMING:", res.data);
      setGetRequest(res.data.incoming)
    })
  }, [])
  const { user } = useUser()
  return (

    <ResizablePanelGroup
      orientation="horizontal"
      className=" bg-zinc-100 dark:bg-black">
      <ResizablePanel defaultSize="20%" maxSize="30%" minSize="15%">
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
              <Button className={`relative cursor-pointer  ${selected === "contacts"
                ? "border-b-2 border-black dark:border-white"
                : "border-b-2 border-transparent"
                }`} onClick={() => setSelected("contacts")} variant="ghost">Contacts</Button>
              <Button
                className={`relative cursor-pointer  ${selected === "groups"
                  ? "border-b-2 border-black dark:border-white"
                  : "border-b-2 border-transparent"
                  }`}
                onClick={() => setSelected("groups")} variant="ghost">Groups</Button>
            </ButtonGroup>
            <Dialog>
              <DialogTrigger asChild >
                <Button size="icon" variant="outline" className="bg-transparent rounded-full cursor-pointer " >+</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="space-x-3" >
                  <Button className={`relative cursor-pointer  ${selected2 === "request"
                    ? "border-b-2 border-black dark:border-white"
                    : "border-b-2 border-transparent"
                    }`} onClick={() => setSelected2("request")} variant="ghost">Friend request</Button>
                  <Button
                    className={`relative cursor-pointer  ${selected2 === "add"
                      ? "border-b-2 border-black dark:border-white"
                      : "border-b-2 border-transparent"
                      }`} onClick={() => setSelected2("add")} variant="ghost">Add Friends</Button>
                  <DialogTitle></DialogTitle>
                </DialogHeader>
                {selected2 === "add" && (
                  users.map((u) => (
                    <div key={u._id} className="hover:bg-zinc-700/20 p-2 rounded-md flex justify-between " >
                      <div className=" " >
                        {u.username}
                      </div>
                      <button onClick={() => sendFriendsRequest(u.username)} className="text-xs font-semibold text-black hover:text-green-600 dark:text-white dark:hover:text-green-600 cursor-pointer " >Add friends</button>
                    </div>
                  ))
                )}
                {selected2 === "request" && (
                  getRequest.map((u) => (
                    <div className="flex items-center justify-between" key={u._id} >
                      <div>{u.requester.username}</div>
                      <div className=" flex space-x-2" >
                        <Check onClick={() => acceptRequest(u._id)} className="w-5 h-5 cursor-pointer text-green-600 " />
                        <Ban onClick={() => deleteRequest(u._id)} className="w-5 h-5 cursor-pointer text-red-600  " />
                      </div>
                    </div>
                  ))
                )}
              </DialogContent>
            </Dialog>
          </div>
          {selected === "contacts" && (
            connection.map((u) => (
              <div onClick={() => startConversation(
                [currentUserId!, u._id],
                u.username
              )} key={u._id} className="hover:bg-zinc-700/20 p-2 rounded-md flex justify-between " >
                {u.username}
              </div>
            ))
          )}


        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="relative" defaultSize="75%">
        <div className="flex  flex-1 h-full flex-col ">
          {!conversationId && (
            <div className="absolute top-0  h-screen w-screen rotate-180 transform bg-white dark:bg-black "></div>
          )}
          {conversationId && (
            <div className=" flex  flex-1 h-full flex-col p-2" >
              <div className="h-12 border-b  border-zinc-700/20 dark:border-zinc-200/25 font-semibold flex items-center  " >
                <span className="ml-2" > {activeChatName}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.map((msg) => {
                  const isMe =
                    String(msg.senderId) === String(currentUserId);

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

            </div>

          )}
        </div>

      </ResizablePanel>
    </ResizablePanelGroup>


  );
};

export default MainPage;
