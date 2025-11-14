import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import chatHandler from "./socket/socketHandler.js";

import {
  addMessage,
  getMessages,
  searchMessages,
  markAsRead,
  getUnreadCount,
} from "./utils/messageStore.js";

import { clerkMiddleware } from "@clerk/express";
import { requireAuth } from "@clerk/express";

app.use(clerkMiddleware());
app.use("/api/posts", requireAuth(), postsRouter);
app.post("/api/posts", requireAuth(), async (req, res) => {
  const userId = req.auth.userId; // logged-in user
  res.json({ message: "Authorized", user: userId });
});
app.get("/api/profile", requireAuth(), (req, res) => {
  res.json({
    userId: req.auth.userId,
    sessionId: req.auth.sessionId,
  });
});



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// ✅ REST routes for fetching/searching messages
app.get("/messages/:room", (req, res) => {
  const { room } = req.params;
  const { skip = 0, limit = 20 } = req.query;
  const msgs = getMessages(room, { skip: Number(skip), limit: Number(limit) });
  res.json(msgs);
});

app.get("/search/:room", (req, res) => {
  const { room } = req.params;
  const { q } = req.query;
  const results = searchMessages(room, q || "");
  res.json(results);
});

app.get("/unread/:room/:user", (req, res) => {
  const { room, user } = req.params;
  const unread = getUnreadCount(room, user);
  res.json({ unread });
});

// ✅ SOCKET.IO SETUP (Using namespace)
const chatNs = io.of("/chat");
chatHandler(chatNs); // ✅ FIXED FUNCTION CALL

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
