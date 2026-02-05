"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../hooks/useAuth";
import { MainLayout } from "../components/layout/MainLayout";
import Dashboard from "../pages/dashboard";
import SuppliesPage from "../pages/supplies";
import InvoicesPage from "../pages/invoices";
import PaymentsPage from "../pages/payments";
import ReportsPage from "../pages/reports";
import { useRouter, usePathname } from "next/navigation";

// BYPASS AUTHENTICATION FOR FRONTEND TESTING
// Set this to false to enable authentication when backend is ready
const BYPASS_AUTH = true;

export default function Home() {
  const {
    user,
    isAuthenticated,
    fetchCurrentUser,
    signIn,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // MVP credentials
  const MVP_EMAIL = "jaabir_yahyaz@icloud.com";
  const MVP_PASSWORD = "TESTING123";

  const [email, setEmail] = useState(MVP_EMAIL);
  const [password, setPassword] = useState(MVP_PASSWORD);

  useEffect(() => {
    // Check if user is authenticated on app load
    // Only fetch current user if there's a stored token
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!isAuthenticated && token && !BYPASS_AUTH) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await signIn(email, password);
  };

  // BYPASS AUTHENTICATION: Directly show dashboard
  if (BYPASS_AUTH) {
    return (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    );
  }

  // For now, show a simple landing page that will redirect to login or dashboard
  // In a real app, you'd have a proper login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bridge Ledger
            </h1>
            <p className="text-gray-600">
              Manual-first commerce management for Nairobi businesses
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              MVP credentials pre-filled above
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPageComponent = () => {
    switch (pathname) {
      case "/supplies":
        return <SuppliesPage />;
      case "/invoices":
        return <InvoicesPage />;
      case "/payments":
        return <PaymentsPage />;
      case "/reports":
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return <MainLayout>{getPageComponent()}</MainLayout>;
}
