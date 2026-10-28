import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getChatSession = (sessionId) =>
  axios.get(`${API}/chat/session/${sessionId}`, authHeader());

export const getChatMessages = (sessionId) =>
  axios.get(`${API}/chat/${sessionId}/messages`, authHeader());

export const sendChatMessage = (sessionId, content) =>
  axios.post(`${API}/chat/${sessionId}/messages`, { content }, authHeader());

export const closeChatSession = (sessionId) =>
  axios.put(`${API}/chat/session/${sessionId}/close`, {}, authHeader());
