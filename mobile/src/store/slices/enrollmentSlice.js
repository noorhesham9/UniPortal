import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentAPI, courseAPI } from '../../utils/api';

// Fetch available courses
export const fetchAvailableCourses = createAsyncThunk(
  'enrollment/fetchAvailableCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseAPI.getAvailableCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch completed hours
export const fetchCompletedHours = createAsyncThunk(
  'enrollment/fetchCompletedHours',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getCompletedHours(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Register for course/section
export const registerForCourse = createAsyncThunk(
  'enrollment/registerForCourse',
  async ({ studentId, sectionId }, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.createEnrollment({
        student: studentId,
        section: sectionId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Join waitlist
export const joinWaitlist = createAsyncThunk(
  'enrollment/joinWaitlist',
  async ({ studentId, sectionId }, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.joinWaitlist({
        student: studentId,
        section: sectionId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const initialState = {
  courses: [],
  enrollments: [],
  completedHours: 0,
  loading: false,
  error: null,
  registrationLoading: false,
};

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch available courses
    builder
      .addCase(fetchAvailableCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchAvailableCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch completed hours
    builder
      .addCase(fetchCompletedHours.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompletedHours.fulfilled, (state, action) => {
        state.loading = false;
        state.completedHours = action.payload.completedHours || 0;
      })
      .addCase(fetchCompletedHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register for course
    builder
      .addCase(registerForCourse.pending, (state) => {
        state.registrationLoading = true;
        state.error = null;
      })
      .addCase(registerForCourse.fulfilled, (state, action) => {
        state.registrationLoading = false;
        // Update local enrollments state if needed
        if (!state.enrollments.find((e) => e._id === action.payload._id)) {
          state.enrollments.push(action.payload);
        }
      })
      .addCase(registerForCourse.rejected, (state, action) => {
        state.registrationLoading = false;
        state.error = action.payload;
      });

    // Join waitlist
    builder
      .addCase(joinWaitlist.pending, (state) => {
        state.registrationLoading = true;
        state.error = null;
      })
      .addCase(joinWaitlist.fulfilled, (state, action) => {
        state.registrationLoading = false;
        if (!state.enrollments.find((e) => e._id === action.payload._id)) {
          state.enrollments.push(action.payload);
        }
      })
      .addCase(joinWaitlist.rejected, (state, action) => {
        state.registrationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
