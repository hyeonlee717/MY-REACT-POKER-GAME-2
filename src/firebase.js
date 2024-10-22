// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd6m2RtwkrHt3FV15y7OBw2iDYwHBv9wg",
  authDomain: "my-react-poker-game-2.firebaseapp.com",
  projectId: "my-react-poker-game-2",
  storageBucket: "my-react-poker-game-2.appspot.com",
  messagingSenderId: "470501305969",
  appId: "1:470501305969:web:a1ea7ca8b7db30253ff5d0",
  measurementId: "G-KV15G8SLSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
