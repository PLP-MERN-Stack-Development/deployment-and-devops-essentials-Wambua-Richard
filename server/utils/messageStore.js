// server/utils/messageStore.js
// In-memory message store with reactions, pagination, and read receipts

let messages = [];

/**
 * Save or add a new message
 */
export const addMessage = (message) => {
  const newMessage = {
    id: messages.length + 1,
    ...message,
    timestamp: message.timestamp || new Date(),
    delivered: false,
    readBy: message.readBy || [message.sender],
    reactions: message.reactions || [], // store emoji reactions
  };
  messages.push(newMessage);
  return newMessage;
};

// Alias for backward compatibility
export const saveMessage = addMessage;

/**
 * Retrieve messages for a room with pagination
 */
export const getMessages = (room, { skip = 0, limit = 20 } = {}) => {
  const roomMessages = messages
    .filter((msg) => msg.room === room)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return roomMessages.slice(skip, skip + limit);
};

/**
 * Mark a message as delivered
 */
export const markDelivered = (messageId) => {
  const msg = messages.find((m) => m.id === messageId);
  if (msg) msg.delivered = true;
  return msg;
};

/**
 * Mark message as read by a user
 */
export const markAsRead = (messageId, username) => {
  const msg = messages.find((m) => m.id === messageId);
  if (msg && !msg.readBy.includes(username)) {
    msg.readBy.push(username);
  }
  return msg;
};

/**
 * Add a reaction (like, love, laugh, etc.) to a message
 */
export const addReactionToMessage = (messageId, reaction, username) => {
  const msg = messages.find((m) => m.id === messageId);
  if (!msg) return null;

  // Check if user already reacted with same emoji
  const existing = msg.reactions.find(
    (r) => r.user === username && r.reaction === reaction
  );

  if (existing) {
    // Remove reaction if clicked again (toggle)
    msg.reactions = msg.reactions.filter(
      (r) => !(r.user === username && r.reaction === reaction)
    );
  } else {
    msg.reactions.push({ user: username, reaction });
  }

  return msg;
};

/**
 * Get unread count for a specific user in a room
 */
export const getUnreadCount = (room, username) => {
  return messages.filter(
    (msg) => msg.room === room && !msg.readBy.includes(username)
  ).length;
};

/**
 * Search messages in a room by text
 */
export const searchMessages = (room, query) => {
  return messages.filter(
    (msg) =>
      msg.room === room &&
      msg.text?.toLowerCase().includes(query.toLowerCase())
  );
};

/**
 * Save file or image message
 */
export const saveFileMessage = ({ sender, room, fileUrl, fileName }) => {
  const newMessage = {
    id: messages.length + 1,
    sender,
    room,
    text: null,
    fileUrl,
    fileName,
    timestamp: new Date(),
    readBy: [sender],
    delivered: false,
    reactions: [],
  };
  messages.push(newMessage);
  return newMessage;
};

/**
 * Clear message store
 */
export const clearMessages = () => {
  messages = [];
};
