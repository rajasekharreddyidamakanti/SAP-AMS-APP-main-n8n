import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const aiSearch = (query) =>
  axios.post(`${API}/ai-search`, { query }, authHeader());
