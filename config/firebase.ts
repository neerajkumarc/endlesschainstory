// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY!,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
