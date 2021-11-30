import { initializeApp } from "firebase/app"
import { getDatabase, ref, set } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyDO_jOto5Pc9kzNMdR41h5ftZOZdAb1hds",
    authDomain: "firestore-practice-20489.firebaseapp.com",
    projectId: "firestore-practice-20489",
    databaseURL:"https://firestore-practice-20489-default-rtdb.firebaseio.com/",
    storageBucket: "firestore-practice-20489.appspot.com",
    messagingSenderId: "229228310599",
    appId: "1:229228310599:web:77c5db15908156c8578162",
    measurementId: "G-42444M7D7T"
  });
  
export const database = getDatabase(firebaseApp)
// export const messaging = getMessaging();
