import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Task } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { handleFirestoreError, OperationType } from "@/lib/firestore-error";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  resetTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const tasksData: Task[] = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() } as Task);
        });
        // Sort by creation date descending
        tasksData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTasks(tasksData);
      },
      (error) => {
        console.error("Firestore Error:", error);
        handleFirestoreError(error, OperationType.LIST, "tasks");
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = async (task: Task) => {
    try {
      const taskData = { ...task, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, "tasks", task.id), taskData);
    } catch (error) {
      console.error("Error adding task:", error);
      handleFirestoreError(error, OperationType.CREATE, `tasks/${task.id}`);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const taskRef = doc(db, "tasks", updatedTask.id);
      // Remove id from the update payload
      const { id, ...updateData } = updatedTask;
      await updateDoc(taskRef, { ...updateData, updatedAt: new Date().toISOString() } as any);
    } catch (error) {
      console.error("Error updating task:", error);
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${updatedTask.id}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  const resetTasks = async () => {
    if (!currentUser) return;
    try {
      const { getDocs, query, where } = await import("firebase/firestore");
      
      // 1. Delete all tasks
      const tasksSnap = await getDocs(collection(db, "tasks"));
      for (const taskDoc of tasksSnap.docs) {
        await deleteDoc(doc(db, "tasks", taskDoc.id));
      }
      
      // 2. Delete all users except the current one (to keep the session alive)
      const usersSnap = await getDocs(query(collection(db, "users"), where("id", "!=", currentUser.id)));
      for (const userDoc of usersSnap.docs) {
        await deleteDoc(doc(db, "users", userDoc.id));
      }

      // Reload to ensure everything is fresh
      window.location.reload();
    } catch (error) {
      console.error("Error resetting tasks:", error);
      handleFirestoreError(error, OperationType.DELETE, "tasks");
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, resetTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
