import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";


import { 
        getAuth,
        onAuthStateChanged,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut       
 } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import{
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC79ssk8JEK3Wdabj4ZAG8DAXqjdX7DuxQ",
  authDomain: "f-square-1e84a.firebaseapp.com",
  projectId: "f-square-1e84a",
  storageBucket: "f-square-1e84a.firebasestorage.app",
  messagingSenderId: "576583840684",
  appId: "1:576583840684:web:6f6ed0e0037fc41d2f0009",
  measurementId: "G-PQPQMPS4Q8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
const db = getFirestore(app);


onAuthStateChanged(auth, (user) => {
    if(user){
        document.getElementById("log-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
        console.log("User is signed in");
    }else[
        window.location.href = "login.html"
    ]
});




document.getElementById("logout-btn").onclick = () => {
    signOut(auth).then(() => window.location.href = "login.html");
};