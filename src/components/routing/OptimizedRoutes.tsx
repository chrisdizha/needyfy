
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { useCodeSplitting } from '@/hooks/useCodeSplitting';

export const OptimizedRoutes = () => {
  const { createLazyComponent } = useCodeSplitting();

  // Create lazy components with performance optimization
  const LazyPublicHome = createLazyComponent(
    () => import('@/pages/PublicHome'),
    'PublicHome',
    { preload: true } // Preload critical routes
  );

  const LazyEquipmentDetails = createLazyComponent(
    () => import('@/pages/EquipmentDetails'),
    'EquipmentDetails'
  );

  const LazyProfile = createLazyComponent(
    () => import('@/pages/Profile'),
    'Profile'
  );

  const LazyDashboard = createLazyComponent(
    () => import('@/pages/Dashboard'),
    'Dashboard'
  );

  const LazyAdmin = createLazyComponent(
    () => import('@/pages/Admin'),
    'Admin'
  );

  return (
    <Routes>
      {/* Critical routes with immediate loading */}
      <Route 
        path="/" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/PublicHome')}
            componentName="PublicHome"
          />
        } 
      />
      
      <Route 
        path="/login" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/Login')}
            componentName="Login"
          />
        } 
      />

      {/* Standard lazy-loaded routes */}
      <Route 
        path="/equipment/:id" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/EquipmentDetails')}
            componentName="EquipmentDetails"
          />
        } 
      />

      <Route 
        path="/profile" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/Profile')}
            componentName="Profile"
          />
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/Dashboard')}
            componentName="Dashboard"
          />
        } 
      />

      <Route 
        path="/equipment" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/Equipment')}
            componentName="Equipment"
          />
        } 
      />

      <Route 
        path="/categories" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/Categories')}
            componentName="Categories"
          />
        } 
      />

      {/* Admin routes with access control */}
      <Route 
        path="/admin/*" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/Admin')}
            componentName="Admin"
          />
        } 
      />

      {/* Fallback for unknown routes */}
      <Route 
        path="*" 
        element={
          <LazyLoadWrapper
            componentImport={() => import('@/pages/NotFound')}
            componentName="NotFound"
          />
        } 
      />
    </Routes>
  );
};
