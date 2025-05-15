// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import type { Database } from "firebase/database";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0th_kRyEX4JTbOQ81VjRTzl33W_IkOuw",
  authDomain: "gerenciador-financeiro-d4660.firebaseapp.com",
  databaseURL: "https://gerenciador-financeiro-d4660-default-rtdb.firebaseio.com",
  projectId: "gerenciador-financeiro-d4660",
  storageBucket: "gerenciador-financeiro-d4660.firebasestorage.app",
  messagingSenderId: "282671664665",
  appId: "1:282671664665:web:66132502c2850d87c2e488",
  measurementId: "G-8QERS07Q3X"
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Database = getDatabase(app);