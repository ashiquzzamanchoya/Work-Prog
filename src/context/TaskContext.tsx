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
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed database with mock data for demo purposes
          const { mockTasks } = await import("@/data/mockData");
          for (const task of mockTasks) {
            try {
              await setDoc(doc(db, "tasks", task.id), task);
            } catch (e) {
              console.error("Error seeding task", e);
              handleFirestoreError(e, OperationType.CREATE, `tasks/${task.id}`);
            }
          }
        } else {
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
        }
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
      await setDoc(doc(db, "tasks", task.id), task);
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
      await updateDoc(taskRef, updateData as any);
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

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
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
