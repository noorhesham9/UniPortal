import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAOaf5bHKBsz_fRUH81iM9M6XoZuk29DDI",
  authDomain: "uni-portal-64dc1.firebaseapp.com",
  projectId: "uni-portal-64dc1",
  storageBucket: "uni-portal-64dc1.firebasestorage.app",
  messagingSenderId: "1020662570093",
  appId: "1:1020662570093:web:ce7a1f51ae64bcdccfb364",
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    // Already initialized — just get the existing instance
    auth = getAuth(app);
  }
}

export { auth };
