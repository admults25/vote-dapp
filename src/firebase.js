// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXu9NggtApPLlnPbyo7t_RfFrskPjvIso",
  authDomain: "son-dapp.firebaseapp.com",
  projectId: "son-dapp",
  storageBucket: "son-dapp.appspot.com",
  messagingSenderId: "163990745484",
  appId: "1:163990745484:web:3489973cd15007223ee6a9",
  measurementId: "G-VHCGYT2E12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// src/App.js
import React from 'react';
import { app, analytics } from './firebase';
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(app);

function App() {
  const getData = async () => {
    const querySnapshot = await getDocs(collection(db, "your-collection"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <div className="App">
      <h1>Firebase ile Veri Çekme</h1>
    </div>
  );
}

export default App;
