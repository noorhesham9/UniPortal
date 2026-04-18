import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { courseAPI, enrollmentAPI, gradesAPI } from "../../utils/api";

// Fetch available courses
export const fetchAvailableCourses = createAsyncThunk(
  "enrollment/fetchAvailableCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseAPI.getAvailableCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch completed hours
export const fetchCompletedHours = createAsyncThunk(
  "enrollment/fetchCompletedHours",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getCompletedHours(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Register for course/section
export const registerForCourse = createAsyncThunk(
  "enrollment/registerForCourse",
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
  },
);

// Join waitlist
export const joinWaitlist = createAsyncThunk(
  "enrollment/joinWaitlist",
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
  },
);

// Fetch academic records (GPA, semesters, etc.)
export const fetchAcademicRecords = createAsyncThunk(
  "enrollment/fetchAcademicRecords",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getAcademicRecords(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch current semester grades (coursework and final)
export const fetchCurrentSemesterGrades = createAsyncThunk(
  "enrollment/fetchCurrentSemesterGrades",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getCurrentSemesterGrades(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch final results for past semesters
export const fetchFinalResults = createAsyncThunk(
  "enrollment/fetchFinalResults",
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.getFinalResults();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch academic summary (GPA, credits, etc.)
export const fetchAcademicSummary = createAsyncThunk(
  "enrollment/fetchAcademicSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.getMySummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch current semester enrollments
export const fetchCurrentEnrollments = createAsyncThunk(
  "enrollment/fetchCurrentEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getMyEnrollments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Drop enrollment
export const dropEnrollment = createAsyncThunk(
  "enrollment/dropEnrollment",
  async (enrollmentId, { rejectWithValue }) => {
    try {
      await enrollmentAPI.dropEnrollment(enrollmentId);
      return enrollmentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);
// Fetch full academic record
export const fetchFullAcademicRecord = createAsyncThunk(
  "enrollment/fetchFullAcademicRecord",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.getAcademicRecord(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);
const initialState = {
  courses: [],
  sections: [],
  enrollments: [],
  completedHours: 0,
  academicRecords: null,
  currentSemesterGrades: null,
  finalResults: null,
  academicSummary: null,
  currentEnrollments: [],
  fullAcademicRecord: null,
  isRegistrationOpen: false,
  registrationClosedReason: null, // null | 'closed' | 'not_in_slice'
  loading: false,
  error: null,
  registrationLoading: false,
};

const enrollmentSlice = createSlice({
  name: "enrollment",
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
        state.courses = action.payload.courses || [];
        state.sections = action.payload.sections || [];
        state.isRegistrationOpen = true;
        state.registrationClosedReason = null;
      })
      .addCase(fetchAvailableCourses.rejected, (state, action) => {
        state.loading = false;
        // 403 can mean: no active slice ('closed') or student not in slice ('not_in_slice')
        const msg = action.payload || "";
        if (
          msg.includes("No active registration") ||
          msg.includes("currently closed")
        ) {
          state.isRegistrationOpen = false;
          state.registrationClosedReason = "closed";
          state.courses = [];
          state.sections = [];
        } else if (
          msg.includes("not open for your group") ||
          msg.includes("not eligible")
        ) {
          state.isRegistrationOpen = false;
          state.registrationClosedReason = "not_in_slice";
          state.courses = [];
          state.sections = [];
        } else {
          state.error = action.payload;
        }
      });

    // Fetch completed hours
    builder
      .addCase(fetchCompletedHours.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompletedHours.fulfilled, (state, action) => {
        state.loading = false;
        state.completedHours = action.payload.totalCompletedHours || 0;
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

    // Fetch academic records
    builder
      .addCase(fetchAcademicRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.academicRecords = action.payload;
      })
      .addCase(fetchAcademicRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch current semester grades
    builder
      .addCase(fetchCurrentSemesterGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSemesterGrades.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSemesterGrades = action.payload;
      })
      .addCase(fetchCurrentSemesterGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch final results
    builder
      .addCase(fetchFinalResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinalResults.fulfilled, (state, action) => {
        state.loading = false;
        state.finalResults = action.payload;
      })
      .addCase(fetchFinalResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch academic summary
    builder
      .addCase(fetchAcademicSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.academicSummary = action.payload;
      })
      .addCase(fetchAcademicSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch current enrollments
    builder
      .addCase(fetchCurrentEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEnrollments = action.payload.enrollments || [];
      })
      .addCase(fetchCurrentEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch full academic record
    builder
      .addCase(fetchFullAcademicRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFullAcademicRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.fullAcademicRecord = action.payload;
      })
      .addCase(fetchFullAcademicRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Drop enrollment
    builder
      .addCase(dropEnrollment.pending, (state) => {
        state.registrationLoading = true;
        state.error = null;
      })
      .addCase(dropEnrollment.fulfilled, (state, action) => {
        state.registrationLoading = false;
        state.currentEnrollments = state.currentEnrollments.filter(
          (e) => e._id !== action.payload,
        );
      })
      .addCase(dropEnrollment.rejected, (state, action) => {
        state.registrationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
