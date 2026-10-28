// src/api/aibot.js
import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const sendBotMessage = (message, history) =>
  axios.post(`${API}/ai-bot/chat`, { message, history }, authHeader());
