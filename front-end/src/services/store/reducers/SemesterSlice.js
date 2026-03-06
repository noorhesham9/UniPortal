import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSemester, getAllSemesters, updateSemester, deleteSemester } from "../services/semesterService";

export const fetchSemesters = createAsyncThunk("semester/fetchAll", async () => {
    return await getAllSemesters();
});

export const addSemester = createAsyncThunk("semester/create", async (data) => {
    return await createSemester(data);
});

export const editSemester = createAsyncThunk("semester/update", async ({ id, data }) => {
    return await updateSemester(id, data);
});

export const removeSemester = createAsyncThunk("semester/delete", async (id) => {
    await deleteSemester(id);
    return id;
});

const semesterSlice = createSlice({
    name: "semester",
    initialState: {
        semesters: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSemesters.pending, (state) => { state.loading = true; })
            .addCase(fetchSemesters.fulfilled, (state, action) => {
                state.loading = false;
                state.semesters = action.payload;
            })
            .addCase(fetchSemesters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addSemester.fulfilled, (state, action) => {
                state.semesters.push(action.payload);
            })
            .addCase(editSemester.fulfilled, (state, action) => {
                const index = state.semesters.findIndex(s => s._id === action.payload._id);
                if (index !== -1) state.semesters[index] = action.payload;
            })
            .addCase(removeSemester.fulfilled, (state, action) => {
                state.semesters = state.semesters.filter(s => s._id !== action.payload);
            });
    }
});

export default semesterSlice.reducer;