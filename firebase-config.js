// firebase-config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    setDoc,
    query,
    where,
    orderBy,
    onSnapshot 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWVI9VHvxARMSM3JV-bXs_73UjKh25mn4",
    authDomain: "thebaldi-me.firebaseapp.com",
    projectId: "thebaldi-me",
    storageBucket: "thebaldi-me.firebasestorage.app",
    messagingSenderId: "794996190135",
    appId: "1:794996190135:web:444f87525f52d79c7d5632"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firebase services
export { db, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, setDoc, query, where, orderBy, onSnapshot };