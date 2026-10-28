import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Support Requests
export const createSupportRequest = (data) =>
  axios.post(`${API}/support-requests`, data, authHeader());

export const getMyRequests = () =>
  axios.get(`${API}/support-requests/my`, authHeader());

export const getAllSupportRequests = () =>
  axios.get(`${API}/support-requests`, authHeader());

export const getSupportRequestById = (id) =>
  axios.get(`${API}/support-requests/${id}`, authHeader());

export const updateSupportRequest = (id, data) =>
  axios.put(`${API}/support-requests/${id}`, data, authHeader());

export const closeSupportRequest = (id) =>
  axios.put(`${API}/support-requests/${id}/close`, {}, authHeader());

export const escalateSupportRequest = (id) =>
  axios.put(`${API}/support-requests/${id}/escalate`, {}, authHeader());
// Added for testing the data in the project
export const resolveSupportRequest = (id) =>
  axios.put(`${API}/support-requests/${id}/resolve`, {}, authHeader());
// Added for testing the data in the project
export const assignSupportRequest = (id) =>
  axios.put(`${API}/support-requests/${id}/assign`, {}, authHeader());

export const deleteSupportRequest = (id) =>
  axios.delete(`${API}/support-requests/${id}`, authHeader());