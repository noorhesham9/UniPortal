import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  // confirmPasswordReset, <-- removed, switching to updatePassword
  updatePassword,
} from "firebase/auth";
import { authAPI } from "../../utils/api";
import { auth } from "../../utils/firebaseConfig";

// Register user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password, name, StudentID }, { rejectWithValue }) => {
    let firebaseUser = null;
    console.log(StudentID);
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      // Register in backend
      const response = await authAPI.register({
        idToken, // أمان أكتر
        email,
        name,
        StudentID,
      });
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: response.data.name,
        role: response.data.role,
        studentID: response.data.studentID,
        _id: response.data._id,
      };
    } catch (error) {
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error("Failed to delete orphaned firebase user", deleteError);
        }
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get user data from backend
      const response = await authAPI.getMe();

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: response.data.name,
        role: response.data.role,
        studentId: response.data.studentId,
        _id: response.data._id,
        level: response.data.level,
        department: response.data.department,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      await authAPI.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      if (auth.currentUser) {
        console.log("true auth.currentUser");
        const response = await authAPI.getMe();
        return {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          ...response.data,
        };
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Forget password
export const forgetPassword = createAsyncThunk(
  "auth/forgetPassword",
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent";
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Update password (user must be logged in)
export const updatePasswordThunk = createAsyncThunk(
  "auth/updatePassword",
  async (newPassword, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) throw new Error("No authenticated user");
      await updatePassword(auth.currentUser, newPassword);
      return "Password updated successfully";
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false; // توقف عن التحميل بمجرد تحديد حالة المستخدم
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
    // (optional) you can react to updatePasswordThunk if you want to show some state
    builder
      .addCase(updatePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, setLoading } = authSlice.actions;
export default authSlice.reducer; // note: updatePasswordThunk handled in components only (no state change needed)
