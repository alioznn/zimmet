"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "../auth/ProtectedRoute";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
