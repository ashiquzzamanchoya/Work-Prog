import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestore-error";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user in Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          let appUser: AppUser;

          if (userSnap.exists()) {
            appUser = userSnap.data() as AppUser;
          } else {
            // Create new user profile
            appUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "New User",
              email: firebaseUser.email || "",
              avatar:
                firebaseUser.photoURL ||
                `https://ui-avatars.com/api/?name=${firebaseUser.displayName || "User"}`,
              role: "Graphics Designer", // Default role
            };
            await setDoc(userRef, appUser);
          }
          setCurrentUser(appUser);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
