import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your app's Firebase project configuration.
const firebaseConfig = {
  apiKey: 'AIzaSyBc60eYO4wEBwRMXMaHYAw9BR__qxGd3XQ',
  authDomain: 'skateboarding-app-cb3d9.firebaseapp.com',
  projectId: 'skateboarding-app-cb3d9',
  storageBucket: 'skateboarding-app-cb3d9.firebasestorage.app',
  messagingSenderId: '930254122384',
  appId: '1:930254122384:web:1ecd914e94c5a98374d715',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
