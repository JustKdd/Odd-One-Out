// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCiWTDlJa4cH_P3vm-q13WLlsuM2cVN1qo",
    authDomain: "odd-one-out-58bfe.firebaseapp.com",
    projectId: "odd-one-out-58bfe",
    storageBucket: "odd-one-out-58bfe.firebasestorage.app",
    messagingSenderId: "69256314083",
    appId: "1:69256314083:web:73feba20620d22c02199d6",
    measurementId: "G-V0RGHXLBZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Anonymous Auth
export const auth = getAuth(app);
let currentUser: { uid: string } | null = null;
signInAnonymously(auth);
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = { uid: user.uid };
    }
});
export function getCurrentUser() {
    return currentUser;
}