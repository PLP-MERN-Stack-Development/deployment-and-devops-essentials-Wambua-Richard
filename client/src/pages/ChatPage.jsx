import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useChat } from "../hooks/useChat";
import NotificationBell from "../components/NotificationBell";
import ChatRoom from "../components/ChatRoom";

export default function ChatPage() {
  const socket = useSocket();
  const username = localStorage.getItem("username") || "Guest";
  const [room, setRoom] = useState("General");
  const { messages, unread, setUnread } = useChat("global");
  const [msg, setMsg] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [file, setFile] = useState(null);
  const chatEndRef = useRef();

  useEffect(() => {
    if (!socket) return;
    socket.emit("join", { username, room });

  useEffect(() => {
      // Reset unread count when user is on chat
        setUnread(0);
      }, [messages]);
    
    

    socket.on("message", (message) => setMessages((prev) => [...prev, message]));
    socket.on("typing", (name) => setTypingUser(name));
    socket.on("stopTyping", () => setTypingUser(""));
    socket.on("fileShared", (fileMsg) => setMessages((prev) => [...prev, fileMsg]));
    socket.on("userStatus", (users) => setOnlineUsers(users));

    socket.on("reactionAdded", ({ messageId, emoji }) => {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === messageId ? { ...m, reactions: [...(m.reactions || []), emoji] } : m
        )
      );
    });

    return () => {
      socket.off("message");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("fileShared");
      socket.off("reactionAdded");
      socket.off("userStatus");
    };
  }, [socket, room]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (msg.trim()) {
      socket.emit("chatMessage", { msg, room });
      setMsg("");
      socket.emit("stopTyping", { username, room });
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { username, room });
    setTimeout(() => socket.emit("stopTyping", { username, room }), 1000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(",")[1];
      socket.emit("sendFile", { fileData: base64Data, fileName: file.name, room });
    };
    reader.readAsDataURL(file);
  };

  const addReaction = (messageId, emoji) => {
    socket.emit("addReaction", { messageId, emoji, room });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex justify-between">
        <h2>Room: {room}</h2>
        <select
          onChange={(e) => setRoom(e.target.value)}
          className="text-black rounded px-2"
          value={room}
        >
          <option>General</option>
          <option>Developers</option>
          <option>Designers</option>
          <option>Random</option>
        </select>
      </header>

      <div className="flex flex-col h-screen bg-gray-50">
        <header className="flex justify-between items-center p-4 bg-blue-600 text-white shadow-md">
          <h1 className="text-xl font-bold">Global Chat</h1>
          <NotificationBell />
        </header>
          <ChatRoom messages={messages} />
      </div>

      <div className="flex flex-1">
        <aside className="w-60 bg-white p-4 border-r">
          <h3 className="font-semibold mb-2">Online Users</h3>
          <ul>
            {onlineUsers.map((u) => (
              <li key={u.id} className="text-green-600">{u.username}</li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 flex flex-col p-4">
          <div className="flex-1 overflow-y-auto bg-white p-3 border rounded">
            {messages.map((m, i) => (
              <div key={i} className="mb-3">
                <div>
                  <strong>{m.username}</strong> <span className="text-gray-400">{m.time}</span>
                </div>
                {m.text && <p>{m.text}</p>}
                {m.fileUrl && (
                  <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    📎 {m.fileName}
                  </a>
                )}
                <div className="flex gap-2 mt-1">
                  {["👍", "❤️", "😂"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(i, emoji)}
                      className="text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                  {m.reactions && (
                    <span className="text-gray-500 ml-2">
                      {m.reactions.join(" ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
            {typingUser && <p className="italic text-gray-500">{typingUser} is typing...</p>}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 mt-2">
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={handleTyping}
              placeholder="Type a message..."
              className="flex-1 border rounded p-2"
            />
            <input type="file" onChange={handleFileUpload} className="hidden" id="fileInput" />
            <label htmlFor="fileInput" className="bg-gray-300 px-3 py-2 rounded cursor-pointer">
              📎
            </label>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
          </form>
        </main>
      </div>
    </div>
  );
}
