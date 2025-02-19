import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { auth, db, COLLECTIONS, Confession } from '../config/firebase';

// Confession Services
export const confessionServices = {
  async createConfession(confessionData: Omit<Confession, 'id'>) {
    if (!auth.currentUser) throw new Error('No authenticated user');

    const docRef = await addDoc(collection(db, COLLECTIONS.CONFESSIONS), {
      ...confessionData,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async getConfession(confessionId: string) {
    const confessionDoc = await getDoc(doc(db, COLLECTIONS.CONFESSIONS, confessionId));
    return confessionDoc.exists() ? { ...confessionDoc.data(), id: confessionDoc.id } as Confession : null;
  },

  async getConfessions() {
    const q = query(
      collection(db, COLLECTIONS.CONFESSIONS),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Confession[];
  },

  async getUserConfessions(userId: string) {
    const q = query(
      collection(db, COLLECTIONS.CONFESSIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Confession[];
  },

  async deleteConfession(confessionId: string) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    const confessionRef = doc(db, COLLECTIONS.CONFESSIONS, confessionId);
    const confessionDoc = await getDoc(confessionRef);
    
    if (!confessionDoc.exists()) throw new Error('Confession not found');
    if (confessionDoc.data()?.userId !== auth.currentUser.uid) {
      throw new Error('Not authorized to delete this confession');
    }
    
    await deleteDoc(confessionRef);
  },

  async updateConfessionViews(confessionId: string) {
    const confessionRef = doc(db, COLLECTIONS.CONFESSIONS, confessionId);
    await updateDoc(confessionRef, {
      views: (await getDoc(confessionRef)).data()?.views + 1 || 1,
    });
  },
};
