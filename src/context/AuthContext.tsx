import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
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
    let userUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);

          // Determine expected role based on email
          let expectedRole = "Graphics Designer"; // Default role
          if (firebaseUser.email === "rodbonds1169@gmail.com") {
            expectedRole = "Boss";
          } else if (firebaseUser.email === "ashiquzzamanchoya@gmail.com") {
            expectedRole = "Manager";
          } else if (firebaseUser.email === "lazerlit.me@gmail.com") {
            expectedRole = "Graphics Designer";
          }

          if (!userSnap.exists()) {
            // Create new user profile
            const appUser: AppUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "New User",
              email: firebaseUser.email || "",
              avatar:
                firebaseUser.photoURL ||
                `https://ui-avatars.com/api/?name=${firebaseUser.displayName || "User"}`,
              role: expectedRole,
            };
            await setDoc(userRef, appUser);
          } else {
            // If user exists, check if role needs update (only for these specific emails)
            const currentData = userSnap.data() as AppUser;
            const specialEmails = ["rodbonds1169@gmail.com", "ashiquzzamanchoya@gmail.com", "lazerlit.me@gmail.com"];
            if (specialEmails.includes(firebaseUser.email || "") && currentData.role !== expectedRole) {
              await updateDoc(userRef, { role: expectedRole });
            }
          }
          
          // Listen to real-time updates for the current user (e.g. role changes)
          userUnsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setCurrentUser(docSnap.data() as AppUser);
            }
            setIsLoading(false);
          }, (error) => {
            console.error("Error listening to user data:", error);
            setIsLoading(false);
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          });

        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        if (userUnsubscribe) {
          userUnsubscribe();
        }
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
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
