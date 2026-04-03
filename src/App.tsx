/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TaskBoard from "./pages/TaskBoard";
import TaskDetail from "./pages/TaskDetail";
import Login from "./pages/Login";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <TaskProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="board" element={<TaskBoard />} />
                  <Route path="task/:id" element={<TaskDetail />} />
                  {/* Placeholders for other routes */}
                  <Route
                    path="tasks"
                    element={
                      <div className="p-8">
                        <h1 className="text-2xl font-display font-bold">
                          All Tasks
                        </h1>
                        <p className="text-gray-400 mt-2">
                          Table view coming soon.
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path="calendar"
                    element={
                      <div className="p-8">
                        <h1 className="text-2xl font-display font-bold">
                          Calendar
                        </h1>
                        <p className="text-gray-400 mt-2">
                          Calendar view coming soon.
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path="team"
                    element={
                      <div className="p-8">
                        <h1 className="text-2xl font-display font-bold">
                          Team Workload
                        </h1>
                        <p className="text-gray-400 mt-2">
                          Detailed workload view coming soon.
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path="templates"
                    element={
                      <div className="p-8">
                        <h1 className="text-2xl font-display font-bold">
                          Templates
                        </h1>
                        <p className="text-gray-400 mt-2">
                          Brief templates coming soon.
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path="archive"
                    element={
                      <div className="p-8">
                        <h1 className="text-2xl font-display font-bold">
                          Archive
                        </h1>
                        <p className="text-gray-400 mt-2">
                          Archived tasks coming soon.
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <div className="p-8">
                        <h1 className="text-2xl font-display font-bold">
                          Settings
                        </h1>
                        <p className="text-gray-400 mt-2">
                          App settings coming soon.
                        </p>
                      </div>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </TaskProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
