// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
    initializeAuth,
    getAuth,
    getReactNativePersistence,
    Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyAA5Dy-qs_GwCSMaTPNWmyuu1SAdmA9cKk",
    authDomain: "fintracker-88ba5.firebaseapp.com",
    projectId: "fintracker-88ba5",
    storageBucket: "fintracker-88ba5.firebasestorage.app",
    messagingSenderId: "759272994615",
    appId: "1:759272994615:web:ed4e460f41c220577eccb2",
    measurementId: "G-59R29LTE86"
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Always ensure persistence on first init
let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (e: any) {
    auth = getAuth(app);
}

export { app, auth };
