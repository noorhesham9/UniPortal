import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import api from "./api";

export const loginWithToken = async (idToken, turnstileToken) => {
  const res = await api.post("/auth/login", { idToken, turnstileToken });
  return res.data;
};

// Used for silent token refresh (Firebase auto-renews every ~1h) — no Turnstile needed
export const refreshToken = async (idToken) => {
  const res = await api.post("/auth/refresh", { idToken });
  return res.data;
};

export const registerWithToken = async ({ idToken, activationToken, last4, turnstileToken }) => {
  const res = await api.post("/auth/register", { idToken, activationToken, last4, turnstileToken });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logoutApi = async () => {
  // Sign out from Firebase first — this kills the local session
  // so onIdTokenChanged won't auto-login again
  await signOut(auth);
  const res = await api.get("/auth/logout");
  return res.data;
};
