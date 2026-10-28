import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getMyProfile = () =>
  axios.get(`${API}/profile/me`, authHeader());

export const updateMyProfile = (data) =>
  axios.put(`${API}/profile/me`, data, authHeader());
