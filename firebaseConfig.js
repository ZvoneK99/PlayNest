import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCdH8YJE3wIZwiUCLvW-TEnHQMoeksH-kE",
  authDomain: "playnest-3e118.firebaseapp.com",
  projectId: "playnest-3e118",
  storageBucket: "playnest-3e118.firebasestorage.app",
  messagingSenderId: "678068016979",
  appId: "1:678068016979:web:87168825c589f4da0533a6",
  measurementId: "G-Q8PEN2MDR6"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth };

export { initializeApp } from "firebase/app";