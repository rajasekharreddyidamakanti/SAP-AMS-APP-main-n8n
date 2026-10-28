import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getRoles = () =>
  axios.get(`${API}/roles`);

export const requestRole = (data) =>
  axios.post(`${API}/roles/request`, data, authHeader());

export const getPendingRoles = () =>
  axios.get(`${API}/roles/pending`, authHeader());

export const approveRole = (id) =>
  axios.put(`${API}/roles/approve/${id}`, {}, authHeader());

export const rejectRole = (id, message) =>
  axios.put(`${API}/roles/reject/${id}`, { message }, authHeader());

export const getPendingUsers = () =>
  axios.get(`${API}/roles/users/pending`, authHeader());

export const approveUser = (id) =>
  axios.put(`${API}/roles/users/approve/${id}`, {}, authHeader());

export const rejectUser = (id, reason) =>
  axios.put(`${API}/roles/users/reject/${id}`, { reason }, authHeader());

// Admin role management
export const getAdminUsersWithRoles = () =>
  axios.get(`${API}/roles/admin/users`, authHeader());

export const assignRoleToUser = (userId, roleId) =>
  axios.post(`${API}/roles/admin/users/${userId}/assign`, { role_id: roleId }, authHeader());

export const removeRoleFromUser = (userId, roleId) =>
  axios.delete(`${API}/roles/admin/users/${userId}/roles/${roleId}`, authHeader());

export const getPendingRolesWithDetails = () =>
  axios.get(`${API}/roles/admin/pending`, authHeader());