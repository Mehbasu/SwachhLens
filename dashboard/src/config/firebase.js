import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAPspkFvLNJcRgmWuK3L9gXHGl4TcOFLJM",
  authDomain: "swachhlens-8ba8b.firebaseapp.com",
  projectId: "swachhlens-8ba8b",
  storageBucket: "swachhlens-8ba8b.firebasestorage.app",
  messagingSenderId: "1067769915168",
  appId: "1:1067769915168:web:27ccbbb8618eef562a9945",
  measurementId: "G-48WZK4L25S"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
