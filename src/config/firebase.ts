import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCcs-ndwNeXL35sxfZ3b_L4d4EuqqKRWPs",
  authDomain: "confession-wall-737da.firebaseapp.com",
  projectId: "confession-wall-737da",
  storageBucket: "confession-wall-737da.appspot.com",
  messagingSenderId: "375135699311",
  appId: "1:375135699311:web:c4a09a6e645023eee0689a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.warn("Persistence failed, falling back to session persistence:", error);
    return setPersistence(auth, browserSessionPersistence);
  });

// Initialize Storage
const storage = getStorage(app);

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  CONFESSIONS: 'confessions',
  HIDDEN_CONFESSIONS: 'hiddenConfessions',
  REPLIES: 'replies',
  USERS: 'users',
  TEMPLATES: 'templates'
} as const;

// Firestore types
export type ConfessionType = 'letter' | 'card' | 'note' | 'poem' | 'story';

export interface BaseConfession {
  content: string;
  type: ConfessionType;
  pin: number;
  userId: string;
  createdAt: string;
  views: number;
  isHidden: boolean;
}

export interface Confession extends BaseConfession {
  id: string;
}

export interface NewConfession extends BaseConfession {
  views: 0;
  isHidden: false;
}

export interface HiddenConfession {
  userId: string;
  confessionId: string;
  hiddenAt: string;
}

export interface Reply {
  id: string;
  content: string;
  userId: string;
  pin: number;
  createdAt: string;
  parentId: string;
}

export interface BaseReply {
  content: string;
  userId: string;
  pin: number;
  createdAt: string;
  parentId: string;
}

export interface NewReply extends BaseReply {
  id?: never;
}

// Theme configurations for different confession types
export const confessionThemes = {
  letter: {
    bg: 'linear-gradient(to right, #f6e7ea, #fff5f7)',
    border: '2px solid #feb2b2',
    font: "'Dancing Script', cursive",
    shadow: 'lg',
    icon: '💌'
  },
  card: {
    bg: 'linear-gradient(to right, #e6fffa, #f0fff4)',
    border: '2px solid #9ae6b4',
    font: "'Montserrat', sans-serif",
    shadow: 'xl',
    icon: '💝'
  },
  note: {
    bg: 'linear-gradient(to right, #fff5f7, #fefcbf)',
    border: '2px dashed #fbd38d',
    font: "'Indie Flower', cursive",
    shadow: 'md',
    icon: '📝'
  },
  poem: {
    bg: 'linear-gradient(to right, #ebf4ff, #e6fffa)',
    border: '2px solid #90cdf4',
    font: "'Playfair Display', serif",
    shadow: 'lg',
    icon: '📜'
  },
  story: {
    bg: 'linear-gradient(to right, #faf5ff, #fff5f7)',
    border: '2px solid #d6bcfa',
    font: "'Lora', serif",
    shadow: 'xl',
    icon: '📖'
  }
};

// Export services
export { auth, db, storage };
