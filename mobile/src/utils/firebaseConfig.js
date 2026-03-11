import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
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
const app = initializeApp(firebaseConfig);

// التعديل عشان يشتغل ويب وموبايل صح:
let auth;

if (Platform.OS === "web") {
  // لو ويب استخدم getAuth العادي
  auth = getAuth(app);
} else {
  // لو موبايل استخدم الـ Persistence اللي بيحفظ الداتا
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth };
