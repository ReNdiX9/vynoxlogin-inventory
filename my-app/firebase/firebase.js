import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCYmVXlgZCMPHg6jD8qnF39hOD4h8Xi87M",
  authDomain: "vynox-login-inventory.firebaseapp.com",
  projectId: "vynox-login-inventory",
  storageBucket: "vynox-login-inventory.firebasestorage.app",
  messagingSenderId: "499445212795",
  appId: "1:499445212795:web:9f723966ee6e561dd0a4de"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
