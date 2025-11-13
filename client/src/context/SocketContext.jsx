import React, { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // autoReconnect options: attempts, backoff
  const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  const chatSocket = useMemo(() => {
    return io(`${baseUrl}/chat`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });
  }, [baseUrl]);

  useEffect(() => {
    chatSocket.on("connect", () => console.log("connected to /chat", chatSocket.id));
    chatSocket.on("reconnect_attempt", (attempt) => console.log("reconnect attempt", attempt));
    chatSocket.on("disconnect", (reason) => console.log("disconnected", reason));
    return () => {
      chatSocket.disconnect();
    };
  }, [chatSocket]);

  // Expose chatSocket (and a helper to create private namespace sockets)
  const createPrivateSocket = (username) => {
    // you may create a namespace per user e.g. /private, but here we reuse private namespace
    return io(`${baseUrl}/private`, { auth: { username } });
  };

  return <SocketContext.Provider value={{ chatSocket, createPrivateSocket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
