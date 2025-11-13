// client/src/hooks/useChat.js
import { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import useChat from "../hooks/useChat";


const useChat = (room = "General") => {
  const { chatSocket } = useSocket();
  const [messages, setMessages] = useState([]); // oldest -> newest for display
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pendingDeliveryRef = useRef(new Set());

  useEffect(() => {
    if (!chatSocket) return;

    // join the room and request the first page via REST for consistent ordering
    chatSocket.emit("joinRoom", { username: localStorage.getItem("username"), room }, (res) => {
      // joined
    });

    // listen
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Ask client to ACK delivery back to server after render
      // We'll send 'messageDelivered' after adding to UI
    };
    const onSystem = (sys) => {
      setMessages((prev) => [...prev, { ...sys, system: true }]);
    };
    const onReaction = ({ messageId, emoji }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: [...(m.reactions || []), emoji] } : m)));
    };

    chatSocket.on("message", onMessage);
    chatSocket.on("system", onSystem);
    chatSocket.on("reactionUpdate", onReaction);

    return () => {
      chatSocket.off("message", onMessage);
      chatSocket.off("system", onSystem);
      chatSocket.off("reactionUpdate", onReaction);
      chatSocket.emit("leaveRoom", { room }, () => {});
    };
  }, [chatSocket, room]);

  // load page (REST): pages: 1 = newest (last N)
  const loadPage = async (p = 1, limit = 20) => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
    const res = await axios.get(`${baseUrl}/api/messages`, { params: { room, page: p, limit } });
    const pageMsgs = res.data.messages || [];
    // when page ===1, we want to set messages to pageMsgs (older-first)
    if (p === 1) {
      setMessages(pageMsgs);
    } else {
      // older messages prepend
      setMessages((prev) => [...pageMsgs, ...prev]);
    }
    setHasMore(pageMsgs.length === limit);
    setPage(p);
  };

  // convenience to load older messages
  const loadOlder = async () => {
    const next = page + 1;
    await loadPage(next);
    setPage(next);
  };

  // send message with ack
  const sendMessage = (text) => {
    return new Promise((resolve, reject) => {
      chatSocket.emit("sendMessage", { room, text }, (ack) => {
        // ack: { ok: true, messageId }
        if (ack && ack.ok) {
          // optimistic UI: add placeholder message with id
          // server will also broadcast message (so de-duplication strategy might be needed)
          resolve(ack);
        } else {
          reject(new Error("send failed"));
        }
      });
    });
  };

  // notify server that message was delivered (client calls this after rendering)
  const markDelivered = (messageId) => {
    chatSocket.emit("messageDelivered", { messageId });
  };

  // search
  const search = async (q) => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
    const res = await axios.get(`${baseUrl}/api/messages/search`, { params: { q, room } });
    return res.data;
  };

  return { messages, loadPage, loadOlder, hasMore, sendMessage, markDelivered, search };
}

export default useChat;