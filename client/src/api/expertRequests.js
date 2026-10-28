// import axios from "axios";

// const API = "http://localhost:3001/api";

// const authHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
// });

// export const createExpertRequest = (data) =>
//   axios.post(`${API}/expert-request`, data, authHeader());

// export const getPendingExpertRequests = () =>
//   axios.get(`${API}/expert-request/pending`, authHeader());

// export const acceptExpertRequest = (id) =>
//   axios.put(`${API}/expert-request/${id}/accept`, {}, authHeader());

// export const rejectExpertRequest = (id) =>
//   axios.put(`${API}/expert-request/${id}/reject`, {}, authHeader());

// export const reassignExpertRequest = (id, expertId) =>
//   axios.put(`${API}/expert-requests/${id}/reassign`, { expert_id: expertId }, authHeader());




// 
// cahnged for testing the data

import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const createExpertRequest = (data) =>
  axios.post(`${API}/expert-request`, data, authHeader());

export const getPendingExpertRequests = () =>
  axios.get(`${API}/expert-request/pending`, authHeader());

export const getMyExpertRequests = () =>
  axios.get(`${API}/expert-request/mine`, authHeader());

//  Added for testing the Expert Requests data
export const getAllExpertRequests = () =>
  axios.get(`${API}/expert-request/admin/all`, authHeader());
// 
export const acceptExpertRequest = (id, reply) =>
  axios.put(`${API}/expert-request/${id}/accept`, { reply }, authHeader());

export const rejectExpertRequest = (id) =>
  axios.put(`${API}/expert-request/${id}/reject`, {}, authHeader());

export const resolveExpertRequest = (id) =>
  axios.put(`${API}/expert-request/${id}/resolve`, {}, authHeader());

export const closeExpertRequest = (id) =>
  axios.put(`${API}/expert-request/${id}/close`, {}, authHeader());

export const reassignExpertRequest = (id, expertId) =>
  axios.put(`${API}/expert-request/${id}/reassign`, { expert_id: expertId }, authHeader());

export const escalateExpertRequest = (id, expertId) =>
  axios.put(`${API}/expert-request/${id}/escalate`, { expert_id: expertId }, authHeader());

export const deleteExpertRequest = (id) =>
  axios.delete(`${API}/expert-request/${id}`, authHeader());
