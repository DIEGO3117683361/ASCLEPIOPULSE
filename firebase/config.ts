import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyASKkTsdCUkJLFgYVOp7QKbTEGGRc_YX1w",
  authDomain: "pulse-1e2a5.firebaseapp.com",
  projectId: "pulse-1e2a5",
  storageBucket: "pulse-1e2a5.appspot.com",
  messagingSenderId: "689916187311",
  appId: "1:689916187311:web:d3c6aa2402e186f5ddfa5a",
  measurementId: "G-SEHQ45VCWP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);
