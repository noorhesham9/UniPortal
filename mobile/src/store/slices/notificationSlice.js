import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/notifications/my");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const markNotificationsRead = createAsyncThunk(
  "notifications/markRead",
  async (ids = [], { rejectWithValue }) => {
    try {
      await apiClient.patch("/notifications/mark-read", { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateFcmToken = createAsyncThunk(
  "notifications/updateFcmToken",
  async () => {}, // no-op: push notifications removed
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addLocalNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        if (ids.length === 0) {
          // mark all
          state.items = state.items.map((n) => ({ ...n, isRead: true }));
          state.unreadCount = 0;
        } else {
          state.items = state.items.map((n) =>
            ids.includes(n._id) ? { ...n, isRead: true } : n,
          );
          state.unreadCount = state.items.filter((n) => !n.isRead).length;
        }
      });
  },
});

export const { addLocalNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
