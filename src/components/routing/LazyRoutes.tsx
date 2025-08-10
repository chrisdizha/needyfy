
import { lazy } from 'react';

// Lazy load all page components
export const LazyPublicHome = lazy(() => import('@/pages/PublicHome'));
export const LazyAuthenticatedHome = lazy(() => import('@/pages/AuthenticatedHome'));
export const LazyLogin = lazy(() => import('@/pages/Login'));
export const LazyRegister = lazy(() => import('@/pages/Register'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazyAdmin = lazy(() => import('@/pages/Admin'));
export const LazyEquipment = lazy(() => import('@/pages/Equipment'));
export const LazyNewEquipment = lazy(() => import('@/pages/NewEquipment'));
export const LazyEditEquipment = lazy(() => import('@/pages/EditEquipment'));
export const LazyEquipmentDetails = lazy(() => import('@/pages/EquipmentDetails'));
export const LazyNewReport = lazy(() => import('@/pages/NewReport'));
export const LazyReportDetails = lazy(() => import('@/pages/ReportDetails'));
export const LazyEditReport = lazy(() => import('@/pages/EditReport'));
export const LazyNewDispute = lazy(() => import('@/pages/NewDispute'));
export const LazyDisputeDetails = lazy(() => import('@/pages/DisputeDetails'));
export const LazyEditDispute = lazy(() => import('@/pages/EditDispute'));
export const LazyForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
export const LazyResetPassword = lazy(() => import('@/pages/ResetPassword'));
export const LazyTerms = lazy(() => import('@/pages/Terms'));
export const LazyPrivacy = lazy(() => import('@/pages/Privacy'));
export const LazyContact = lazy(() => import('@/pages/Contact'));
export const LazyAbout = lazy(() => import('@/pages/About'));
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
export const LazyCategories = lazy(() => import('@/pages/Categories'));
export const LazyListEquipment = lazy(() => import('@/pages/ListEquipment'));
export const LazyBlog = lazy(() => import('@/pages/Blog'));
export const LazyPaymentTerms = lazy(() => import('@/pages/PaymentTerms'));
export const LazyRewards = lazy(() => import('@/pages/Rewards'));
