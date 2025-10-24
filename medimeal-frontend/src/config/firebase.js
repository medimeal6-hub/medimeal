import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDf81QYpkWh6IiYakMs_xBu3GxI03lcejQ",
  authDomain: "medi-826f2.firebaseapp.com",
  projectId: "medi-826f2",
  storageBucket: "medi-826f2.firebasestorage.app",
  messagingSenderId: "1088838483677",
  appId: "1:1088838483677:web:653ed90f1ef4bb4b81a534"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Debug Firebase initialization
console.log('🔥 Firebase initialized:', {
  app: !!app,
  auth: !!auth,
  googleProvider: !!googleProvider,
  projectId: firebaseConfig.projectId
});

export default app;
