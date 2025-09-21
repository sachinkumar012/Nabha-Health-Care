import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

// Context and hooks
import { useAuth } from "./context/AuthContext";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

// Components
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import OfflineIndicator from "./components/Common/OfflineIndicator";
import PWAInstallPrompt from "./components/Common/PWAInstallPrompt";

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const AppointmentsPage = lazy(() => import("./pages/AppointmentsPage"));
const SymptomCheckerPage = lazy(() => import("./pages/SymptomCheckerPage"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress size={48} />
    <Box sx={{ textAlign: "center", color: "text.secondary" }}>Loading...</Box>
  </Box>
);

function App() {
  const { user, loading } = useAuth();
  const isOnline = useOnlineStatus();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="App">
        {/* Offline indicator */}
        <OfflineIndicator show={!isOnline} />

        {/* PWA install prompt */}
        <PWAInstallPrompt />

        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <Layout>
                <Suspense fallback={<LoadingScreen />}>
                  <HomePage />
                </Suspense>
              </Layout>
            }
          />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Suspense fallback={<LoadingScreen />}>
                  <LoginPage />
                </Suspense>
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Suspense fallback={<LoadingScreen />}>
                  <RegisterPage />
                </Suspense>
              )
            }
          />

          {/* Public medical tools */}
          <Route
            path="/symptom-checker"
            element={
              <Layout>
                <Suspense fallback={<LoadingScreen />}>
                  <SymptomCheckerPage />
                </Suspense>
              </Layout>
            }
          />

          {/* TODO: Implement these pages
          <Route 
            path="/medicines" 
            element={
              <Layout>
                <Suspense fallback={<LoadingScreen />}>
                  <MedicinesPage />
                </Suspense>
              </Layout>
            } 
          />
          
          <Route 
            path="/pharmacies" 
            element={
              <Layout>
                <Suspense fallback={<LoadingScreen />}>
                  <PharmaciesPage />
                </Suspense>
              </Layout>
            } 
          />
          */}
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <DashboardPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <AppointmentsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* TODO: Implement these appointment-related pages
          <Route 
            path="/appointments/book" 
            element={
              <ProtectedRoute roles={['patient']}>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <BookAppointmentPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/appointments/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <AppointmentDetailsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/video-call/:appointmentId" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <VideoCallPage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          */}

          {/* TODO: Implement health records pages
          <Route 
            path="/health-records" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <HealthRecordsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/health-records/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <HealthRecordDetailsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } 
          />
          */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 page */}
          <Route
            path="*"
            element={
              <Layout>
                <Suspense fallback={<LoadingScreen />}>
                  <NotFoundPage />
                </Suspense>
              </Layout>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
