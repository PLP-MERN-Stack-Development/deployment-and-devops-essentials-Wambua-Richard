// Handles tracking connected users and their chat rooms

const users = []; // In-memory user list

// Add a user when they join
export const addUser = ({ id, username, room }) => {
  // Clean data
  username = username?.trim().toLowerCase();
  room = room?.trim().toLowerCase();

  // Validate
  if (!username || !room) {
    return { error: "Username and room are required." };
  }

  // Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) {
    return { error: "Username is already taken in this room." };
  }

  const user = { id, username, room, online: true };
  users.push(user);
  return { user };
};

// Remove a user (on disconnect)
export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get a user by socket ID
export const getUserById = (id) => {
  return users.find((user) => user.id === id);
};

// ✅ This was missing!
export const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

// Get all online users (optional utility)
export const getOnlineUsers = () => users.filter((u) => u.online);

// Mark user as offline
export const markUserOffline = (id) => {
  const user = getUserById(id);
  if (user) user.online = false;
  return user;
};
