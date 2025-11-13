// server/socket/socketHandler.js
import {
    addMessage,
    markDelivered,
    markAsRead,
    addReactionToMessage,
    getMessages,
    getUnreadCount,
  } from "../utils/messageStore.js";
  
  import {
    addUser,
    removeUser,
    getUserById,
    getUsersInRoom,
  } from "../utils/users.js";
  
  export default function chatHandler(io) {
    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);
  
      // --- JOIN ROOM / CHANNEL ---
      socket.on("joinRoom", ({ username, room }) => {
        const user = addUser(socket.id, username, room);
        socket.join(room);
  
        // Welcome and notify others
        socket.emit("message", {
          sender: "System",
          text: `Welcome to ${room}, ${username}!`,
          timestamp: new Date(),
        });
  
        socket.broadcast.to(room).emit("message", {
          sender: "System",
          text: `${username} has joined the chat`,
          timestamp: new Date(),
        });
  
        // Update online users list
        io.to(room).emit("roomUsers", getUsersInRoom(room));
  
        // Notify user’s unread messages
        const unread = getUnreadCount(room, username);
        socket.emit("unreadCount", unread);
      });
  
      // --- TYPING INDICATOR ---
      socket.on("typing", ({ room, username, isTyping }) => {
        socket.broadcast.to(room).emit("userTyping", { username, isTyping });
      });
  
      // --- PUBLIC MESSAGE ---
      socket.on("chatMessage", ({ room, sender, text }) => {
        const msg = addMessage(room, sender, text);
        io.to(room).emit("message", msg);
  
        // --- Notifications ---
        socket.broadcast.to(room).emit("notification", {
          sender,
          text: "New message",
          timestamp: new Date(),
        });
      });
  
      // --- PRIVATE MESSAGE ---
      socket.on("privateMessage", ({ sender, recipient, text }) => {
        const msg = addMessage(`pm_${sender}_${recipient}`, sender, text, {
          private: true,
        });
  
        const recipientSocket = getUserById(recipient);
        if (recipientSocket) {
          io.to(recipientSocket.id).emit("privateMessage", msg);
        }
  
        // Notify sender their message is sent
        socket.emit("messageDelivered", { to: recipient, id: msg.id });
      });
  
      // --- FILE / IMAGE SHARING ---
      socket.on("shareFile", ({ room, sender, fileName, fileUrl }) => {
        const msg = addMessage(room, sender, `📎 Shared file: ${fileName}`, {
          fileUrl,
        });
        io.to(room).emit("fileShared", msg);
      });
  
      // --- MESSAGE REACTIONS ---
      socket.on("reactToMessage", ({ messageId, reaction, username, room }) => {
        const updated = addReactionToMessage(messageId, reaction, username);
        io.to(room).emit("messageReaction", updated);
      });
  
      // --- MESSAGE READ RECEIPT ---
      socket.on("markAsRead", ({ room, username }) => {
        markAsRead(room, username);
        io.to(room).emit("readReceipt", { room, username });
      });
  
      // --- DELIVERY ACK ---
      socket.on("delivered", ({ messageId }) => {
        markDelivered(messageId);
      });
  
      // --- MESSAGE PAGINATION ---
      socket.on("loadMoreMessages", ({ room, skip = 0, limit = 20 }) => {
        const older = getMessages(room, { skip, limit });
        socket.emit("olderMessages", older);
      });
  
      // --- DISCONNECT ---
      socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
          io.to(user.room).emit("message", {
            sender: "System",
            text: `${user.username} has left the chat`,
            timestamp: new Date(),
          });
          io.to(user.room).emit("roomUsers", getUsersInRoom(user.room));
        }
        console.log("❌ User disconnected:", socket.id);
      });
  
      // --- RECONNECTION HANDLING ---
      socket.on("reconnect_attempt", () => {
        console.log(`🔁 ${socket.id} attempting to reconnect`);
        socket.emit("systemMessage", {
          text: "Reconnecting...",
        });
      });
    });
  }
  