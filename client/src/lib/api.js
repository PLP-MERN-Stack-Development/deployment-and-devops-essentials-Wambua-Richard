// src/lib/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------- POSTS -------------------
export const fetchPosts = async (params = {}) => {
  const { data } = await api.get("/posts", { params });
  return data;
};

export const fetchPostById = async (id) => {
  const { data } = await api.get(`/posts/${id}`);
  return data;
};

export const createPost = async (postData) => {
  const formData = new FormData();
  for (const key in postData) formData.append(key, postData[key]);

  const { data } = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updatePost = async (id, postData) => {
  const { data } = await api.put(`/posts/${id}`, postData);
  return data;
};

export const deletePost = async (id) => {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
};

// ------------------- CATEGORIES -------------------
export const fetchCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post("/categories", categoryData);
  return data;
};

// ------------------- AUTH -------------------
export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

// ------------------- COMMENTS -------------------
export const fetchComments = async (postId) => {
  const { data } = await api.get(`/posts/${postId}/comments`);
  return data;
};

export const addComment = async (postId, commentData) => {
  const { data } = await api.post(`/posts/${postId}/comments`, commentData);
  return data;
};

export default api;
