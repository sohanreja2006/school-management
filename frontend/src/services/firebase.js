import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDT28dguBgV-CXYMpdtHcJjKhAT6udOJm4",
  authDomain: "Academix-ad128.firebaseapp.com",
  projectId: "Academix-ad128",
  storageBucket: "Academix-ad128.firebasestorage.app",
  messagingSenderId: "628890854110",
  appId: "1:628890854110:web:6a73df3305b02ea2f2184f",
  measurementId: "G-Y3BE6VSP98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = null; // typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, analytics };
