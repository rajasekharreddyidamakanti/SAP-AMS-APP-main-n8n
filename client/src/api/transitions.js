import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAllTransitions = () =>
  axios.get(`${API}/transition`, authHeader());

export const getTransitionById = (id) =>
  axios.get(`${API}/transition/${id}`, authHeader());

export const getTransitionTasks = (id) =>
  axios.get(`${API}/transition/${id}/tasks`, authHeader());

export const updateTaskStatus = (taskId, status, extra = {}) =>
  axios.put(`${API}/transition/tasks/${taskId}`, { status, ...extra }, authHeader());

export const createTransitionTask = (transitionId, data) =>
  axios.post(`${API}/transition/${transitionId}/tasks`, data, authHeader());

export const updateTransitionTaskDetails = (taskId, data) =>
  axios.put(`${API}/transition/tasks/${taskId}/details`, data, authHeader());

export const deleteTransitionTask = (taskId) =>
  axios.delete(`${API}/transition/tasks/${taskId}`, authHeader());

export const getTaskAttachments = (taskId) =>
  axios.get(`${API}/transition/tasks/${taskId}/attachments`, authHeader());

export const uploadTaskAttachment = (taskId, file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${API}/transition/tasks/${taskId}/attachments`, form, {
    ...authHeader(),
    headers: { ...authHeader().headers, "Content-Type": "multipart/form-data" },
  });
};

export const deleteTaskAttachment = (attachmentId) =>
  axios.delete(`${API}/transition/task-attachments/${attachmentId}`, authHeader());

export const getPhaseProgress = (transitionId) =>
  axios.get(`${API}/transition/${transitionId}/phase-progress`, authHeader());

export const createTransition = (data) =>
  axios.post(`${API}/transition`, data, authHeader());

export const getTransitionChecklist = (transitionId) =>
  axios.get(`${API}/transition-checklist/${transitionId}`, authHeader());

export const updateChecklistItem = (checklistId, data) =>
  axios.put(`${API}/transition-checklist/${checklistId}`, data, authHeader());
//  Added for Testing teh data
export const getMyTransitions = () =>
  axios.get(`${API}/transition/mine`, authHeader());

export const deleteTransition = (id) =>
  axios.delete(`${API}/transition/${id}`, authHeader());

//