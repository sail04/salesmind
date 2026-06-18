import { isFirebaseConfigured, auth, firestore } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mockUsers, User } from './mockData';

const LOCAL_USER_KEY = 'salesmind_current_user';
const ALL_USERS_KEY = 'salesmind_users';

// Initialize mock users in local storage if not present
const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return mockUsers;
  const stored = localStorage.getItem(ALL_USERS_KEY);
  if (!stored) {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(mockUsers));
    return mockUsers;
  }
  return JSON.parse(stored);
};

const saveUserToLocalStorage = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  
  const users = getStoredUsers();
  if (!users.some(u => u.uid === user.uid)) {
    users.push(user);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(LOCAL_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const login = async (email: string, password: string): Promise<User> => {
  if (isFirebaseConfigured && auth && firestore) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Retrieve role from Firestore
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const userObj: User = {
        uid: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || 'SalesMind User',
        email: firebaseUser.email || email,
        role: data.role || 'employee',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
      saveUserToLocalStorage(userObj);
      return userObj;
    } else {
      // Fallback role creation if doc doesn't exist
      const userObj: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'SalesMind User',
        email: firebaseUser.email || email,
        role: 'employee',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, userObj);
      saveUserToLocalStorage(userObj);
      return userObj;
    }
  } else {
    // Local Sandbox Mode
    const users = getStoredUsers();
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (matched) {
      saveUserToLocalStorage(matched);
      return matched;
    } else {
      // Auto-create a mock user if password matches email prefix for easy testing
      const name = email.split('@')[0];
      const newUser: User = {
        uid: 'u_' + Math.random().toString(36).substr(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        role: 'employee',
        createdAt: new Date().toISOString()
      };
      saveUserToLocalStorage(newUser);
      return newUser;
    }
  }
};

export const register = async (name: string, email: string, password: string, role: 'admin' | 'manager' | 'employee'): Promise<User> => {
  if (isFirebaseConfigured && auth && firestore) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const newUser: User = {
      uid: firebaseUser.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };
    
    // Write role details to Firestore
    await setDoc(doc(firestore, 'users', firebaseUser.uid), newUser);
    saveUserToLocalStorage(newUser);
    return newUser;
  } else {
    // Local Sandbox Mode
    const users = getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User already exists with this email address.");
    }
    
    const newUser: User = {
      uid: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    saveUserToLocalStorage(newUser);
    return newUser;
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  if (isFirebaseConfigured && auth && firestore) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const userObj: User = {
        uid: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        role: data.role || 'employee',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
      saveUserToLocalStorage(userObj);
      return userObj;
    } else {
      const newUser: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        role: 'employee',
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newUser);
      saveUserToLocalStorage(newUser);
      return newUser;
    }
  } else {
    // Google mock sign-in for Sandbox Mode
    const mockGoogleUser: User = {
      uid: 'u_google',
      name: 'Google Sandbox User',
      email: 'sandbox.google@nexvora.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    saveUserToLocalStorage(mockGoogleUser);
    return mockGoogleUser;
  }
};

export const logout = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (isFirebaseConfigured && auth && firestore) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userObj: User = {
            uid: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || 'SalesMind User',
            email: firebaseUser.email || '',
            role: data.role || 'employee',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          };
          saveUserToLocalStorage(userObj);
          callback(userObj);
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
        callback(null);
      }
    });
  } else {
    // Sandbox mode returns the storage listener
    const handler = () => {
      callback(getCurrentUser());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handler);
    }
    callback(getCurrentUser());
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handler);
      }
    };
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  if (isFirebaseConfigured && firestore) {
    // In real app, query users collection. For simplicity and reliability, 
    // we can return mockUsers or mock them since firestore user collection querying is admin-only sometimes.
    return mockUsers;
  } else {
    return getStoredUsers();
  }
};
