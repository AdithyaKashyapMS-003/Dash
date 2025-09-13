

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
 apiKey: "AIzaSyCeWw5rPkuV9IWd8fXfyTB5EHviGSubq6A",
  authDomain: "hackathon-a19f4.firebaseapp.com",
  projectId: "hackathon-a19f4",
  storageBucket: "hackathon-a19f4.firebasestorage.app",
  messagingSenderId: "733643376404",
  appId: "1:733643376404:web:9bdc22a6c27e44ea5ea401"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
