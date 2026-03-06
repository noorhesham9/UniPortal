import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import SemesterReducer from "./reducers/SemesterSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    semester: SemesterReducer,
  },
});