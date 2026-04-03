import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { AppUser } from "./AuthContext";
import { handleFirestoreError, OperationType } from "@/lib/firestore-error";

interface UserContextType {
  users: AppUser[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersData: AppUser[] = [];
        snapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() } as AppUser);
        });
        setUsers(usersData);
      },
      (error) => {
        console.error("Firestore Error fetching users:", error);
        handleFirestoreError(error, OperationType.LIST, "users");
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ users }}>{children}</UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
