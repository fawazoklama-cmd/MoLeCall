import { initializeApp } from 'firebase/app';
import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { createStarterPrivateProfile, createStarterPublicProfile } from '../data/collection';
import { Friendship, MatchRecord, PrivateProfile, PublicProfile } from '../types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline fallback active.');
    }
    return false;
  }
}

export function subscribeAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
  avatarId: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username.slice(0, 24) });
  await ensurePlayerProfiles(cred.user, username, avatarId);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await ensurePlayerProfiles(cred.user, cred.user.displayName || 'SkyKnight', 'avatar_aether');
  return cred.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  await signOut(auth);
}

export async function ensurePlayerProfiles(
  user: User,
  fallbackUsername?: string,
  avatarId = 'avatar_aether'
): Promise<{ publicProfile: PublicProfile; privateProfile: PrivateProfile }> {
  const pubPath = `usersPublic/${user.uid}`;
  const privPath = `usersPrivate/${user.uid}`;
  let pub: PublicProfile | null = null;
  let priv: PrivateProfile | null = null;

  try {
    const pubSnap = await getDoc(doc(db, 'usersPublic', user.uid));
    if (pubSnap.exists()) {
      pub = pubSnap.data() as PublicProfile;
    } else {
      pub = createStarterPublicProfile(user.uid, fallbackUsername || user.displayName || 'SkyPlayer');
      pub.avatar = avatarId;
      await setDoc(doc(db, 'usersPublic', user.uid), pub);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, pubPath);
  }

  try {
    const privSnap = await getDoc(doc(db, 'usersPrivate', user.uid));
    if (privSnap.exists()) {
      priv = privSnap.data() as PrivateProfile;
    } else {
      priv = createStarterPrivateProfile(user.uid, user.email || undefined);
      await setDoc(doc(db, 'usersPrivate', user.uid), priv);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, privPath);
  }

  return { publicProfile: pub!, privateProfile: priv! };
}

export async function savePublicProfile(uid: string, patch: Partial<PublicProfile>) {
  const path = `usersPublic/${uid}`;
  try {
    await updateDoc(doc(db, 'usersPublic', uid), {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function savePrivateProfile(uid: string, patch: Partial<PrivateProfile>) {
  const path = `usersPrivate/${uid}`;
  try {
    await updateDoc(doc(db, 'usersPrivate', uid), {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function recordMatchToFirestore(record: Omit<MatchRecord, 'id'>): Promise<MatchRecord> {
  const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `matches/${id}`;
  const full: MatchRecord = { ...record, id };
  try {
    const { id: _ignore, ...payload } = full;
    await setDoc(doc(db, 'matches', id), payload);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function fetchUserMatches(uid: string): Promise<MatchRecord[]> {
  const path = 'matches';
  try {
    const q = query(
      collection(db, 'matches'),
      where('ownerUid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MatchRecord, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchLeaderboardProfiles(): Promise<PublicProfile[]> {
  const path = 'usersPublic';
  try {
    const q = query(
      collection(db, 'usersPublic'),
      where('rankPoints', '>=', 0),
      orderBy('rankPoints', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PublicProfile);
  } catch {
    return [];
  }
}

export async function searchPlayersByQuery(term: string): Promise<PublicProfile[]> {
  try {
    const q = query(collection(db, 'usersPublic'), where('rankPoints', '>=', 0), limit(40));
    const snap = await getDocs(q);
    const lower = term.trim().toLowerCase();
    return snap.docs
      .map((d) => d.data() as PublicProfile)
      .filter(
        (p) =>
          p.username.toLowerCase().includes(lower) || p.playerId.toLowerCase().includes(lower)
      );
  } catch {
    return [];
  }
}

export async function fetchUserFriendships(uid: string): Promise<Friendship[]> {
  try {
    const q1 = query(collection(db, 'friendships'), where('requesterUid', '==', uid), limit(30));
    const q2 = query(collection(db, 'friendships'), where('recipientUid', '==', uid), limit(30));
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const map = new Map<string, Friendship>();
    [...s1.docs, ...s2.docs].forEach((d) => {
      map.set(d.id, { id: d.id, ...(d.data() as Omit<Friendship, 'id'>) });
    });
    return Array.from(map.values());
  } catch {
    return [];
  }
}

export async function sendFriendRequest(
  requester: PublicProfile,
  recipient: PublicProfile
): Promise<Friendship> {
  const id = `fr_${requester.uid}_${recipient.uid}`.slice(0, 120);
  const now = new Date().toISOString();
  const payload: Omit<Friendship, 'id'> = {
    requesterUid: requester.uid,
    recipientUid: recipient.uid,
    requesterName: requester.username,
    recipientName: recipient.username,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(doc(db, 'friendships', id), payload);
    return { id, ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `friendships/${id}`);
  }
}

export async function acceptFriendRequest(friendshipId: string) {
  try {
    await updateDoc(doc(db, 'friendships', friendshipId), {
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `friendships/${friendshipId}`);
  }
}

export async function removeFriendship(friendshipId: string) {
  try {
    await deleteDoc(doc(db, 'friendships', friendshipId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `friendships/${friendshipId}`);
  }
}
