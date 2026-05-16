import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const app = admin.initializeApp({
   projectId: firebaseConfig.projectId
});

async function run() {
  try {
    const db = getFirestore(app);
    await db.collection('config').doc('test2').set({ test: true }, { merge: true });
    console.log("Success with default database ID!");
  } catch(e) {
    console.error("Error writing default:", e);
  }
}
run();
