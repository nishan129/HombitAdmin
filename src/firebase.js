// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import { host } from "./api/config";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQBgRiCwHVUJ_9mZdQgQoY6TSnYcTKnek",
  authDomain: "grozzo-8bd18.firebaseapp.com",
  projectId: "grozzo-8bd18",
  storageBucket: "grozzo-8bd18.firebasestorage.app",
  messagingSenderId: "1060728054175",
  appId: "1:1060728054175:web:7904b8d248440bb5d21daa",
  measurementId: "G-SHKLFRR2XZ",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered");
    })
    .catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
}

// Function to refresh the access token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }
  const response = await axios.post(
    `${host}/api/v1/users/refresh-token`,
    { refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", newRefreshToken);
  return accessToken;
}

// Request permission and get token
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BOf5bIzkeCsT2-e5iwT_RFqZ3lwvkjSBGv5BA6O9lnRybsu6Zq4FgbiW0gK6XpHlgMXgBZowmPvXMnO44dHTkOM",
      });
      console.log("FCM Token:", token);

      // Get the access token from localStorage
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found in localStorage");
      }

      // Send token to server
      let response = await axios.post(
        `${host}/api/v1/users/register-admin-token`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // If 401, try refreshing the token
      if (response.data.statusCode === 401) {
        console.log("Token might be expired, attempting to refresh...");
        accessToken = await refreshAccessToken();
        response = await axios.post(
          `${host}/api/v1/users/register-admin-token`,
          { token },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      console.log("Token registered:", token);
      return token;
    }
  } catch (error) {
    console.error("Error getting permission/token:", error);
    throw error; // Re-throw the error to handle it in the calling component if needed
  }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/path-to-icon.png",
  };

  new Notification(notificationTitle, notificationOptions);
});