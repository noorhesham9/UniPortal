import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./slices/authSlice";
import enrollmentReducer from "./slices/enrollmentSlice";

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["user", "isAuthenticated", "firebaseToken"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const logger = (store) => (next) => (action) => {
  const result = next(action);
  console.log(`[Redux] ${action.type}`, JSON.stringify(store.getState(), null, 2));
  return result;
};

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    enrollment: enrollmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(logger),
});

export const persistor = persistStore(store);
