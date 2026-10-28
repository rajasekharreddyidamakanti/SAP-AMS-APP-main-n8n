import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : { headers: {} };
};

export const submitResumeMatch = (formData) =>
  axios.post(`${API}/resume-match`, formData, {
    ...authHeader(),
    headers: {
      ...(authHeader().headers || {}),
      "Content-Type": "multipart/form-data",
    },
  });
