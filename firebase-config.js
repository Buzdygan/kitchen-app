// firebase-config.js
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
// import { getAuth } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';
// import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js';

// // Your web app's Firebase configuration
// // IMPORTANT: Replace these placeholder values with your actual Firebase configuration
// // You can find these values in your Firebase console under Project Settings
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// export { auth, db }; 

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSoHKgyFDgA4pe1-3iV0cJOsQUHvlqjR8",
  authDomain: "virtual-kitchen-c677f.firebaseapp.com",
  projectId: "virtual-kitchen-c677f",
  storageBucket: "virtual-kitchen-c677f.firebasestorage.app",
  messagingSenderId: "196843514635",
  appId: "1:196843514635:web:5a38fa66f55ab5edf0900e",
  measurementId: "G-KY4HXMK0BN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 
