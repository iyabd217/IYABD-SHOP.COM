import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { getAuth, signInAnonymously } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const q = doc(db, 'products', 'test');
    const snapshot = await getDoc(q);
    console.log('Product fetched successfully:', snapshot.exists());
    process.exit(0);
  } catch (e) {
    console.error('Failed to fetch:', e);
    process.exit(1);
  }
}

test();
