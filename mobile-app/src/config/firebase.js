import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAPspkFvLNJcRgmWuK3L9gXHGl4TcOFLJM",
  authDomain: "swachhlens-8ba8b.firebaseapp.com",
  projectId: "swachhlens-8ba8b",
  storageBucket: "swachhlens-8ba8b.firebasestorage.app",
  messagingSenderId: "1067769915168",
  appId: "1:1067769915168:web:27ccbbb8618eef562a9945",
  measurementId: "G-48WZK4L25S"
};

let app, auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
