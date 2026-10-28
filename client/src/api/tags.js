// import axios from "axios";

// const API = "http://localhost:3001/api";

// const authHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
// });

// // ── Admin tag CRUD ────────────────────────────────────────────────────────
// export const getAllTags        = ()           => axios.get(`${API}/tags/admin/all`, authHeader());
// export const createTag        = (tag_name)   => axios.post(`${API}/tags/admin/create`, { tag_name }, authHeader());
// export const updateTag        = (id, tag_name) => axios.put(`${API}/tags/admin/${id}`, { tag_name }, authHeader());
// export const deleteTag        = (id)         => axios.delete(`${API}/tags/admin/${id}`, authHeader());

// // ── Admin pending tag requests ────────────────────────────────────────────
// export const getPendingTagsWithDetails = () => axios.get(`${API}/tags/admin/pending`, authHeader());
// export const approveTag  = (id)       => axios.put(`${API}/tags/approve/${id}`, {}, authHeader());
// export const rejectTag   = (id)       => axios.put(`${API}/tags/reject/${id}`, {}, authHeader());

// // ── Admin user-tag management ─────────────────────────────────────────────
// export const getUsersWithTags   = ()                  => axios.get(`${API}/tags/admin/users`, authHeader());
// export const assignTagToUser    = (userId, tag_id)    => axios.post(`${API}/tags/admin/users/${userId}/assign`, { tag_id }, authHeader());
// export const removeTagFromUser  = (userId, tagId)     => axios.delete(`${API}/tags/admin/users/${userId}/tags/${tagId}`, authHeader());

// changed database for testing the database

import axios from "axios";

const API = "http://localhost:3001/api";

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const getAllTags = () =>
    axios.get(`${API}/tags/admin/all`, authHeader());

export const createTag = (tag_name) =>
    axios.post(
        `${API}/tags/admin/create`,
        { tag_name },
        authHeader()
    );

export const updateTag = (id, tag_name) =>
    axios.put(
        `${API}/tags/admin/${id}`,
        { tag_name },
        authHeader()
    );

export const deleteTag = (id) =>
    axios.delete(
        `${API}/tags/admin/${id}`,
        authHeader()
    );

export const getPendingTagsWithDetails = () =>
    axios.get(
        `${API}/tags/admin/pending`,
        authHeader()
    );

export const approveTag = (id) =>
    axios.put(
        `${API}/tags/approve/${id}`,
        {},
        authHeader()
    );

export const rejectTag = (id) =>
    axios.put(
        `${API}/tags/reject/${id}`,
        {},
        authHeader()
    );

export const getUsersWithTags = () =>
    axios.get(
        `${API}/tags/admin/users`,
        authHeader()
    );

export const assignTagToUser = (userId, tag_id) =>
    axios.post(
        `${API}/tags/admin/users/${userId}/assign`,
        { tag_id },
        authHeader()
    );

export const removeTagFromUser = (userId, tagId) =>
    axios.delete(
        `${API}/tags/admin/users/${userId}/tags/${tagId}`,
        authHeader()
    );