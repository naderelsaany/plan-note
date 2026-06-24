import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export async function getUserDocuments(userId) {
  try {
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return { docs: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })), error: null };
  } catch (error) {
    return { docs: [], error: error.message };
  }
}

export async function getDocument(docId) {
  try {
    const docRef = doc(db, 'documents', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { doc: { id: docSnap.id, ...docSnap.data() }, error: null };
    return { doc: null, error: 'المستند غير موجود' };
  } catch (error) {
    return { doc: null, error: error.message };
  }
}

export async function createDocument(userId, title, type) {
  try {
    const defaultContent = type === 'note'
      ? ''
      : JSON.stringify({ elements: [], appState: { viewBackgroundColor: '#ffffff' } });

    const docRef = await addDoc(collection(db, 'documents'), {
      userId,
      title,
      type,
      content: defaultContent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
}

export async function updateDocument(docId, content) {
  try {
    await updateDoc(doc(db, 'documents', docId), {
      content,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteDocument(docId) {
  try {
    await deleteDoc(doc(db, 'documents', docId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}
