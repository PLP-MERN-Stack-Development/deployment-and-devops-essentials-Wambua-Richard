import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import TypingIndicator from "./TypingIndicator";

export default function ChatRoom({ username, room }) {
  const { messages, sendMessage, sendTyping, typingUsers, loadOlderMessages } =
    useChat(room, username);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef();

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(newMsg);
    setNewMsg("");
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className="chatroom">
      <div className="chat-controls">
        {hasMore && <button onClick={loadOlder}>Load older messages</button>}
        <SearchBox doSearch={search} />
      </div>

      <div className="messages-container">
        {messages.map((m) => (
          <div key={m.id || m.time} className={`message ${m.system ? "system" : ""}`}>
            <div className="meta">
              <strong>{m.system ? "System" : m.username}</strong>
              <span className="time">{new Date(m.time).toLocaleTimeString()}</span>
            </div>
            {m.text && <div className="text">{m.text}</div>}
            {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer">Download</a>}
            <div className="reactions">{(m.reactions || []).join(" ")}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
}

// small components:
function MessageComposer({ onSend }) {
  const [text, setText] = React.useState("");
  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <form onSubmit={onSubmit} className="composer">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." />
      <button type="submit">Send</button>
    </form>
  );
}

function SearchBox({ doSearch }) {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState([]);
  const onSearch = async (e) => {
    e.preventDefault();
    const res = await doSearch(q);
    setResults(res);
  };
  return (
    <div className="search-box">
      <form onSubmit={onSearch}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages..." />
        <button type="submit">Search</button>
      </form>
      <div className="search-results">
        {results.map((r) => (
          <div key={r.id} className="search-result">
            <strong>{r.username}</strong>: {r.text}
          </div>
        ))}
      </div>
    </div>
  );
}
