// src/api/articles.js

import axios from "axios";

const BASE_URL = "http://localhost:3001/api";

const authHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// =========================
// ARTICLES
// =========================

export const getAllArticles = () =>
  axios.get(`${BASE_URL}/articles`, authHeader());
// =========================
// ARTICLE APPROVALS (ADMIN)
// =========================

export const getPendingArticles = () =>
  axios.get(`${BASE_URL}/articles/pending`, authHeader());

export const approveArticle = (id) =>
  axios.put(`${BASE_URL}/articles/approve/${id}`, {}, authHeader());

export const coAuthorApproveArticle = (id) =>
  axios.put(`${BASE_URL}/articles/co-author-approve/${id}`, {}, authHeader());

export const rejectArticle = (id, reason) =>
  axios.put(`${BASE_URL}/articles/reject/${id}`, { reason }, authHeader());

export const getArticleExperts = (id) =>
  axios.get(`${BASE_URL}/articles/${id}/experts`, authHeader());
export const getArticleById = (id) =>
  axios.get(`${BASE_URL}/articles/${id}`, authHeader());

export const searchArticles = (keyword) =>
  axios.get(
    `${BASE_URL}/articles/search?keyword=${encodeURIComponent(keyword)}`,
    authHeader()
  );

export const createArticle = (data) =>
  axios.post(`${BASE_URL}/articles`, data, authHeader());

export const updateArticle = (id, data) =>
  axios.put(`${BASE_URL}/articles/${id}`, data, authHeader());

export const deleteArticle = (id) =>
  axios.delete(`${BASE_URL}/articles/${id}`, authHeader());

export const updateArticleStatus = (id, status, reason = null) => {
  if (status === "published") {
    return axios.put(`${BASE_URL}/articles/approve/${id}`, {}, authHeader());
  }

  if (status === "rejected") {
    return axios.put(
      `${BASE_URL}/articles/reject/${id}`,
      { reason },
      authHeader()
    );
  }

  return Promise.reject(new Error(`Unsupported article status: ${status}`));
};

// =========================
// ATTACHMENTS
// =========================

export const uploadAttachment = (articleId, file, tags = []) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tags", JSON.stringify(tags));

  const token = localStorage.getItem("token");

  return axios.post(
    `${BASE_URL}/articles/${articleId}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
export const getAttachments = (articleId) =>
  axios.get(
    `${BASE_URL}/articles/${articleId}/attachments`,
    authHeader()
  );

export const deleteAttachment = (attachmentId) =>
  axios.delete(
    `${BASE_URL}/attachments/${attachmentId}`,
    authHeader()
  );

// =========================
// AUTH
// =========================

export const loginUser = (credentials) =>
  axios.post(`${BASE_URL}/auth/login`, credentials);

export const getProfile = () =>
  axios.get(`${BASE_URL}/auth/profile`, authHeader());

// =========================
// USERS (ADMIN)
// =========================

export const getUsers = () =>
  axios.get(`${BASE_URL}/users`, authHeader());

export const createUser = (data) =>
  axios.post(`${BASE_URL}/users`, data, authHeader());

export const updateUser = (id, data) =>
  axios.put(`${BASE_URL}/users/${id}`, data, authHeader());

export const deleteUser = (id) =>
  axios.delete(`${BASE_URL}/users/${id}`, authHeader());
