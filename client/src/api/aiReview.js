import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const aiReviewArticle = (articleId) =>
  axios.get(`${API}/ai-review/${articleId}`, authHeader());
