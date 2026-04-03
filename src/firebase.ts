import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, getDocFromServer, doc } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    } else if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      // This is expected before login, so we can ignore it or log it as a warning
      console.warn("Firestore connection test: Waiting for authentication...");
    } else {
      console.error("Firestore connection test failed:", error);
    }
  }
}
testConnection();
