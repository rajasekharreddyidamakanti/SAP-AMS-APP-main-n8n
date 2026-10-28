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
// GET ALL SECTIONS OF ARTICLE
// =========================
export const getSectionsByArticle = (articleId) =>
  axios.get(
    `${BASE_URL}/sections/article/${articleId}`,
    authHeader()
  );

// =========================
// GET SINGLE SECTION
// =========================
export const getSectionById = (id) =>
  axios.get(
    `${BASE_URL}/sections/${id}`,
    authHeader()
  );

// =========================
// CREATE SECTION
// =========================
export const createSection = (data) =>
  axios.post(
    `${BASE_URL}/sections`,
    data,
    authHeader()
  );

// =========================
// UPDATE SECTION
// =========================
export const updateSection = (id, data) =>
  axios.put(
    `${BASE_URL}/sections/${id}`,
    data,
    authHeader()
  );

// =========================
// DELETE SECTION
// =========================
export const deleteSection = (id) =>
  axios.delete(
    `${BASE_URL}/sections/${id}`,
    authHeader()
  );