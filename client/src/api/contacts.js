import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAllContacts = (filters = {}) =>
  axios.get(`${API}/contacts`, { ...authHeader(), params: filters });

export const getContactById = (id) =>
  axios.get(`${API}/contacts/${id}`, authHeader());

export const createContact = (data) =>
  axios.post(`${API}/contacts`, data, authHeader());

export const updateContact = (id, data) =>
  axios.put(`${API}/contacts/${id}`, data, authHeader());

export const deleteContact = (id) =>
  axios.delete(`${API}/contacts/${id}`, authHeader());

export const getContactHistory = (id) =>
  axios.get(`${API}/contacts/${id}/history`, authHeader());

export const getOnCallContacts = (sap_module) =>
  axios.get(`${API}/contacts/on-call`, {
    ...authHeader(),
    params: sap_module ? { sap_module } : {},
  });

export const getAllEscalationPaths = () =>
  axios.get(`${API}/contacts/escalation`, authHeader());

export const getEscalationPathByModule = (sapModule) =>
  axios.get(`${API}/contacts/escalation/${sapModule}`, authHeader());

export const setEscalationPath = (data) =>
  axios.post(`${API}/contacts/escalation`, data, authHeader());