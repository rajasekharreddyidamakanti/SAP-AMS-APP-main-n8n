import axios from "axios";
const API = axios.create({
  baseURL: "http://localhost:3001/api",
});
export const loginUser = (data) =>
  API.post("/auth/login", data);
export const registerUser = (data) =>
  API.post("/auth/register", data);