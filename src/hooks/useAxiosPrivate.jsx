import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { host } from "@/api/config";
import { refreshAccessTokenThunk } from "@/api/tokenService";
import { store } from "@/app/store";

const axiosPrivate = axios.create({
  baseURL: host,
});

export const useAxiosPrivate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Use an IIFE to handle the async operations
    (async () => {
      const requestIntercept = axiosPrivate.interceptors.request.use(
        (config) => {
          const state = store.getState();
          const accessToken = state.auth.accessToken;

          if (!config.headers["Authorization"] && accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      const responseIntercept = axiosPrivate.interceptors.response.use(
        (response) => response,
        async (error) => {
          const prevRequest = error?.config;

          if (error?.response?.status === 401 && !prevRequest?.sent) {
            prevRequest.sent = true;
            try {
              const newAccessToken = await dispatch(refreshAccessTokenThunk());
              prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return axiosPrivate(prevRequest); // Retry the failed request
            } catch (err) {
              console.error("Refresh token failed:", err);
              navigate("/auth"); // Redirect to login on refresh failure
            }
          }

          return Promise.reject(error);
        }
      );

      return () => {
        axiosPrivate.interceptors.request.eject(requestIntercept);
        axiosPrivate.interceptors.response.eject(responseIntercept);
      };
    })(); // Immediately Invoked Function Expression (IIFE)
  }, [dispatch, navigate]);

  return axiosPrivate;
};
