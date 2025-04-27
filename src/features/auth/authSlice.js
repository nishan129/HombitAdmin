import { createSlice } from "@reduxjs/toolkit";

// Define the initial state
const initialState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    refreshAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

// Export actions
export const { loginSuccess, refreshAccessToken, logout, setUser } =
  authSlice.actions;

// Create a thunk for logging out
export const logoutUser = () => async (dispatch) => {
  try {
    // Clear the tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Dispatch the logout action to update the state
    dispatch(logout());
  } catch (error) {
    console.error("Failed to logout:", error);
  }
};

export default authSlice.reducer;
