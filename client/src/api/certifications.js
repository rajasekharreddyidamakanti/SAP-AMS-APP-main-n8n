import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAllCertifications = () =>
  axios.get(`${API}/certifications`, authHeader());

export const getCertificationsByMember = (memberId) =>
  axios.get(`${API}/certifications/member/${memberId}`, authHeader());

export const createCertification = (data) =>
  axios.post(`${API}/certifications`, data, authHeader());

export const updateCertification = (id, data) =>
  axios.put(`${API}/certifications/${id}`, data, authHeader());

export const deleteCertification = (id) =>
  axios.delete(`${API}/certifications/${id}`, authHeader());
