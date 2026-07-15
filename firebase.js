import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";


import { 
        getAuth,
        onAuthStateChanged,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        
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
        console.log("User is signed in");
        window.location.href = "index.html";
    } 
});



let isSignUp = false;

const authCard = document.getElementById("loginFormEl");
const email = document.getElementById("loginEmail");
const password = document.getElementById("loginPassword");
const toggleAuth = document.getElementById("toggle-auth");
const authTitle = document.getElementById("authTitle");
const authButton = document.getElementById("auth-submit-btn");

toggleAuth.addEventListener("click", (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;

    authTitle.innerText = isSignUp ? "Create Account" : "Welcome Back";
    authButton.innerText = isSignUp ? "Sign Up" : "Login";
    document.getElementById('toggle-msg').innerText = isSignUp ? "Already Have An Account?" : "Dont Have An Account?";
    toggleAuth.innerText = isSignUp ? "Login" : "Sign Up";
});


authCard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailValue = email.value;
    const passwordValue = password.value;

try{
    if(isSignUp ){
    const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
    const user = userCredential.user;

    await setDoc((db, "users", user.uid), {
        email: email,
        createdAt: serverTimestamp
    }, {merge: true});
}else{
    console.log("Attempting to sign in..");
    await signInWithEmailAndPassword(auth, emailValue, passwordValue);
    console.log("Sign in successful");
}

    window.location.href = "login.html";
}

    catch(authError){
        console.error("Authentication error:", authError);
        alert("Authentication failed. Please check your credentials and try again.");
    }

});



