import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const fbConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const fbApp = initializeApp(fbConfig);
const db = getFirestore(fbApp, fbConfig.firestoreDatabaseId);

async function run() {
  try {
    const colRef = collection(db, 'trades');
    await setDoc(doc(colRef, 'test_doc'), { test: true });
    console.log("Write success");
    const snapshot = await getDocs(colRef);
    console.log("Read success, docs:", snapshot.size);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
