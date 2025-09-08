
import React from 'react'
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Routes, Route, Navigate } from "react-router-dom"
import { OptimizedAuthProvider } from '@/contexts/OptimizedAuthContext'
import { SecurityProvider } from '@/components/security/SecurityProvider'
import { ThemeProvider } from "@/providers/ThemeProvider"
import Header from "./components/layout/Header"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import BookingDashboard from "./pages/BookingDashboard"
import Equipment from "./pages/Equipment"
import Categories from "./pages/Categories"
import EquipmentDetails from "./pages/EquipmentDetails"
import ListEquipment from "./pages/ListEquipment"
import PublicHome from "./pages/PublicHome"
import Admin from "./pages/Admin"
import { SecureRoute } from "@/components/auth/SecureRoute"
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring"

console.log('App.tsx - Component initializing');

function AppContent() {
  // Initialize security monitoring
  useSecurityMonitoring();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<PublicHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <SecureRoute>
              <Dashboard />
            </SecureRoute>
          } />
          <Route path="/profile" element={
            <SecureRoute>
              <Profile />
            </SecureRoute>
          } />
          <Route path="/bookings" element={
            <SecureRoute>
              <BookingDashboard />
            </SecureRoute>
          } />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/:id" element={<EquipmentDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/list-equipment" element={
            <SecureRoute>
              <ListEquipment />
            </SecureRoute>
          } />
          <Route path="/admin/*" element={
            <SecureRoute>
              <Admin />
            </SecureRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  console.log('App.tsx - Rendering App component');

  return (
    <OptimizedAuthProvider>
      <SecurityProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </SecurityProvider>
    </OptimizedAuthProvider>
  )
}

export default App
