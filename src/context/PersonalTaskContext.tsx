import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Task } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { handleFirestoreError, OperationType } from "@/lib/firestore-error";

export interface PersonalTask extends Task {
  userId: string;
}

interface PersonalTaskContextType {
  personalTasks: PersonalTask[];
  addPersonalTask: (task: PersonalTask) => Promise<void>;
  updatePersonalTask: (task: PersonalTask) => Promise<void>;
  deletePersonalTask: (taskId: string) => Promise<void>;
}

const PersonalTaskContext = createContext<PersonalTaskContextType | undefined>(undefined);

export function PersonalTaskProvider({ children }: { children: React.ReactNode }) {
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setPersonalTasks([]);
      return;
    }

    const q = query(
      collection(db, "personalTasks"),
      where("userId", "==", currentUser.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData: PersonalTask[] = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() } as PersonalTask);
        });
        tasksData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setPersonalTasks(tasksData);
      },
      (error) => {
        console.error("Firestore Error:", error);
        handleFirestoreError(error, OperationType.LIST, "personalTasks");
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addPersonalTask = async (task: PersonalTask) => {
    try {
      const taskData = { ...task, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, "personalTasks", task.id), taskData);
    } catch (error) {
      console.error("Error adding personal task:", error);
      handleFirestoreError(error, OperationType.CREATE, `personalTasks/${task.id}`);
    }
  };

  const updatePersonalTask = async (updatedTask: PersonalTask) => {
    try {
      const taskRef = doc(db, "personalTasks", updatedTask.id);
      const { id, ...updateData } = updatedTask;
      await updateDoc(taskRef, { ...updateData, updatedAt: new Date().toISOString() } as any);
    } catch (error) {
      console.error("Error updating personal task:", error);
      handleFirestoreError(error, OperationType.UPDATE, `personalTasks/${updatedTask.id}`);
    }
  };

  const deletePersonalTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "personalTasks", taskId));
    } catch (error) {
      console.error("Error deleting personal task:", error);
      handleFirestoreError(error, OperationType.DELETE, `personalTasks/${taskId}`);
    }
  };

  return (
    <PersonalTaskContext.Provider
      value={{ personalTasks, addPersonalTask, updatePersonalTask, deletePersonalTask }}
    >
      {children}
    </PersonalTaskContext.Provider>
  );
}

export function usePersonalTasks() {
  const context = useContext(PersonalTaskContext);
  if (context === undefined) {
    throw new Error("usePersonalTasks must be used within a PersonalTaskProvider");
  }
  return context;
}
