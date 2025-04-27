// authThunks.js
import axios from "axios";
import {
  logout,
  logoutUser,
  refreshAccessToken,
} from "../features/auth/authSlice";
import { host } from "./config";

export const refreshAccessTokenThunk = () => async (dispatch, getState) => {
  console.log("refresh Token called");
  try {
    // const { refreshToken } = getState().auth;
    const refreshToken = localStorage.getItem("refreshToken");

    // console.log(getState());
    const response = await axios.post(`${host}/api/v1/users/auth/refresh`, {
      refreshToken,
    });

    localStorage.setItem("accessToken", response.data.data.accessToken);
    localStorage.setItem("refreshToken", response.data.data.refreshToken);
    console.log("new token get");
    dispatch(
      refreshAccessToken({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      })
    );
    return response.data.data.accessToken;
  } catch (error) {
    dispatch(logoutUser());
    throw error;
  }
};
