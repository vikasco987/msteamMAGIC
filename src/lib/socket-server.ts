import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";
import Pusher from "pusher";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

/**
 * 🛰️ THE ANTIGRAVITY REAL-TIME DISPATCHER (SaaS PRODUCTION GRADE)
 * 
 * 1. PUSHER (PRIMARY): Stateless cloud relay for Vercel/Production deployment.
 * 2. SOCKET.IO (SECONDARY): Persistent singleton for local development.
 */

// 🟢 Strategy 1: Pusher Construction
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

let globalIO: SocketIOServer | null = null;

export const initSocket = (res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    globalIO = res.socket.server.io;
    return res.socket.server.io;
  }
  const io = new SocketIOServer(res.socket.server as any, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" }
  });
  res.socket.server.io = io;
  globalIO = io;
  return io;
};

/**
 * 🚀 UNIVERSAL DISPATCHER (ZERO-CONFIG SWITCH)
 * 
 * This broadcasts the 'matrix_update' heartbeat across the entire fleet.
 * When PUSHER_APP_ID is present, it uses Pusher (SaaS/Serverless Mode).
 * Otherwise, it falls back to Local Socket.io (Dev Mode).
 */
export const emitMatrixUpdate = async () => {
    // 🟠 MODE A: SaaS CLOUD RELAY (PUSHER)
    if (process.env.PUSHER_APP_ID) {
        try {
            console.log("Broadcasting to Operational Shards via Pusher Cloud! ☁️");
            await pusher.trigger("operational-matrix", "matrix_update", { 
                timestamp: Date.now() 
            });
        } catch (error) {
            console.error("Pusher Broadcast Failed:", error);
        }
    }

    // 🟡 MODE B: LOCAL BROADCAST (SOCKET.IO)
    if (globalIO) {
        console.log("Emitting local heartbeat via Socket Cluster! 🛰️");
        globalIO.emit("matrix_update", { timestamp: Date.now() });
    }

    if (!globalIO && !process.env.PUSHER_APP_ID) {
        console.warn("Real-time Broadcast Pulsed 🛸 (No active provider detected)");
    }
};
