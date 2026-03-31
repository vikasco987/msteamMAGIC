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

// 🟢 Strategy 1: Pusher Construction (Lazy Shard)
let pusherInstance: Pusher | null = null;

const getPusher = () => {
    if (pusherInstance) return pusherInstance;
    
    // 🛡️ RECTIFICATION: MUST HAVE ALL KEYS FOR PRODUCTION SYNC
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

    if (!appId || !key || !secret) {
        console.warn("Real-time Broadcast Paused: Pusher Credentials Missing in Shard! 🛸");
        return null;
    }

    pusherInstance = new Pusher({ appId, key, secret, cluster, useTLS: true });
    return pusherInstance;
};

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
    const CHANNEL_NAME = "operational-matrix";
    const EVENT_NAME = "matrix_update";

    // 🟠 MODE A: SaaS CLOUD RELAY (PUSHER)
    const p = getPusher();
    if (p) {
        try {
            console.log(`Broadcasting to [${CHANNEL_NAME}] via Pusher Cloud! ☁️`);
            await p.trigger(CHANNEL_NAME, EVENT_NAME, { 
                timestamp: Date.now(),
                pulseType: "UI_REFETCH"
            });
            console.log("Cloud Shard Dispatched: Pusher Handshake Successful! ✅");
        } catch (error) {
            console.error("Pusher Broadcast Failed:", error);
        }
    }

    // 🟡 MODE B: LOCAL BROADCAST (SOCKET.IO)
    if (globalIO) {
        console.log(`Emitting local heartbeat [${EVENT_NAME}] via Socket Cluster! 🛰️`);
        globalIO.emit(EVENT_NAME, { timestamp: Date.now() });
    }

    if (!globalIO && !p) {
        console.warn("Real-time Broadcast Pulsed 🛸 (No active provider or credentials detected)");
    }
};
