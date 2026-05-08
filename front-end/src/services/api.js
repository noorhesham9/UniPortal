import axios from "axios";
import { auth } from "../utils/firebaseConfig";

// Determine API URL based on environment
const getApiUrl = () => {
  const env = import.meta.env.VITE_NODE_ENV || "development";

  if (env === "production") {
    return import.meta.env.VITE_API_URL_PROD || "http://localhost:3100/api/v1";
  } else {
    return (
      import.meta.env.VITE_API_URL_DEV ||
      "https://uni-portal-blue.vercel.app/api/v1"
    );
  }
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

// Log the API URL being used (for debugging)
console.log("🌐 API URL:", getApiUrl());
console.log("🔧 Environment:", import.meta.env.VITE_NODE_ENV || "development");

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
