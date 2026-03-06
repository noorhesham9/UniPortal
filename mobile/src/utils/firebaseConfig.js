import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAOaf5bHKBsz_fRUH81iM9M6XoZuk29DDI',
  authDomain: 'uni-portal-64dc1.firebaseapp.com',
  projectId: 'uni-portal-64dc1',
  storageBucket: 'uni-portal-64dc1.firebasestorage.app',
  messagingSenderId: '1020662570093',
  appId: '1:1020662570093:web:ce7a1f51ae64bcdccfb364',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
