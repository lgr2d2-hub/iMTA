import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthCallback from "@/components/AuthCallback";
import Layout from "@/components/Layout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Board from "@/pages/Board";
import PostDetail from "@/pages/PostDetail";
import LifeInfo from "@/pages/LifeInfo";
import Petitions from "@/pages/Petitions";
import PetitionDetail from "@/pages/PetitionDetail";
import Reviews from "@/pages/Reviews";
import Profile from "@/pages/Profile";
import MyPosts from "@/pages/MyPosts";
import MyComments from "@/pages/MyComments";
import LikedPosts from "@/pages/LikedPosts";
import SavedPosts from "@/pages/SavedPosts";
import Settings from "@/pages/Settings";

function AppRouter() {
  const location = useLocation();
  // Synchronous check - process session_id BEFORE rendering normal routes
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
      />
      <Route
        path="/board"
        element={<ProtectedRoute><Layout><Board /></Layout></ProtectedRoute>}
      />
      <Route
        path="/board/:categoryId/:postId"
        element={<ProtectedRoute><Layout><PostDetail /></Layout></ProtectedRoute>}
      />
      <Route
        path="/lifeinfo"
        element={<ProtectedRoute><Layout><LifeInfo /></Layout></ProtectedRoute>}
      />
      <Route
        path="/petitions"
        element={<ProtectedRoute><Layout><Petitions /></Layout></ProtectedRoute>}
      />
      <Route
        path="/petitions/:id"
        element={<ProtectedRoute><Layout><PetitionDetail /></Layout></ProtectedRoute>}
      />
      <Route
        path="/reviews"
        element={<ProtectedRoute><Layout><Reviews /></Layout></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>}
      />
      <Route
        path="/profile/posts"
        element={<ProtectedRoute><Layout><MyPosts /></Layout></ProtectedRoute>}
      />
      <Route
        path="/profile/comments"
        element={<ProtectedRoute><Layout><MyComments /></Layout></ProtectedRoute>}
      />
      <Route
        path="/profile/liked"
        element={<ProtectedRoute><Layout><LikedPosts /></Layout></ProtectedRoute>}
      />
      <Route
        path="/profile/saved"
        element={<ProtectedRoute><Layout><SavedPosts /></Layout></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRouter />
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
