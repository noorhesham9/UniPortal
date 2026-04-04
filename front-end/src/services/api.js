import axios from "axios";
import { auth } from "../utils/firebaseConfig";

const api = axios.create({
  baseURL: "http://localhost:3100/api/v1",
  withCredentials: true,
});

// Attach a fresh Firebase ID token before every request
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken(); // auto-refreshes when expired
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
