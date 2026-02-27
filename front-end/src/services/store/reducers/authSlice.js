import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isAuthenticated: false,
  loading: true,
  user: null,
  isAdmin: null,
  opendash: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      if (state.user?._id === action.payload._id) return;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      localStorage.setItem("user", JSON.stringify(action.payload));
      state.isAdmin = action.payload.role.name === "admin";
      state.opendash = false;
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.token = null;
      state.isAdmin = null;
      localStorage.removeItem("user");
    },
    Opendash: (state, action) => {
      state.opendash = true;
    },
    closedash: (state, action) => {
      state.opendash = false;
    },
  },
});

export const { loginStart, loginSuccess, logoutUser, Opendash, closedash } =
  authSlice.actions;

export default authSlice.reducer;
