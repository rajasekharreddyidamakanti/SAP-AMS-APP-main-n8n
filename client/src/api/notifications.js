import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getNotifications = () =>
  axios.get(`${API}/notifications`, authHeader());

export const markNotificationRead = (id) =>
  axios.put(`${API}/notifications/${id}/read`, {}, authHeader());

export const markAllNotificationsRead = () =>
  axios.put(`${API}/notifications/read-all`, {}, authHeader());
