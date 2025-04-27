// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8ffd47r2vVIJuXPLTzNTtiW_sV9f2B_U",
  authDomain: "notification-90633.firebaseapp.com",
  projectId: "notification-90633",
  storageBucket: "notification-90633.firebasestorage.app",
  messagingSenderId: "1055211234717",
  appId: "1:1055211234717:web:c16ddc693a1cc43b593b74",
  measurementId: "G-D554TCHVN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);