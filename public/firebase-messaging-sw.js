// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQBgRiCwHVUJ_9mZdQgQoY6TSnYcTKnek",
    authDomain: "grozzo-8bd18.firebaseapp.com",
    projectId: "grozzo-8bd18",
    storageBucket: "grozzo-8bd18.firebasestorage.app",
    messagingSenderId: "1060728054175",
    appId: "1:1060728054175:web:7904b8d248440bb5d21daa",
    measurementId: "G-SHKLFRR2XZ"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png', // Optional: ensure this file exists in /public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});