import { Server as NetServer,Socket } from "net";
import { NextApiResponse } from "next";
import{ Server as SocketServer} from "socket.io"

export type NextApiResponseServerIO=NextApiResponse &{
    socket:Socket & {
        server:NetServer &{
            io:SocketServer
        }
    }
}