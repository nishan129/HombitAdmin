import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Array of notifications
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // check order.orderStatus !== Delivered && inNotificationBox===true
      state.items.unshift(action.payload); // Add new notification
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter(
        (notification) => notification._id !== action.payload
      ); // Remove notification by ID
    },
    setNotifications: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const { addNotification, removeNotification, setNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
