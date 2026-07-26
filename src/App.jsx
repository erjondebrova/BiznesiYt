import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import MarketingPage from './pages/marketing/MarketingPage'
import MarketingPlanPage from './pages/marketing/MarketingPlanPage'
import ContentCreatorPage from './pages/marketing/ContentCreatorPage'
import CompetitorPage from './pages/marketing/CompetitorPage'
import FinancialPage from './pages/financial/FinancialPage'
import LegalPage from './pages/legal/LegalPage'
import GrowthPage from './pages/growth/GrowthPage'
import SettingsPage from './pages/SettingsPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Onboarding — needs auth but not completed onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoute skipOnboardingCheck>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Protected with Layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Layout><ChatPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute>
          <Layout><ChatPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/marketing" element={
        <ProtectedRoute>
          <Layout><MarketingPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/marketing/plan" element={
        <ProtectedRoute>
          <Layout><MarketingPlanPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/marketing/content" element={
        <ProtectedRoute>
          <Layout><ContentCreatorPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/marketing/compete" element={
        <ProtectedRoute>
          <Layout><CompetitorPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/financial" element={
        <ProtectedRoute>
          <Layout><FinancialPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/financial/*" element={
        <ProtectedRoute>
          <Layout><FinancialPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/legal" element={
        <ProtectedRoute>
          <Layout><LegalPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/legal/*" element={
        <ProtectedRoute>
          <Layout><LegalPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/growth" element={
        <ProtectedRoute>
          <Layout><GrowthPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/growth/*" element={
        <ProtectedRoute>
          <Layout><GrowthPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout><SettingsPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin panel */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout><AdminDashboardPage /></AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminLayout><AdminUsersPage /></AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/users/:id" element={
        <AdminRoute>
          <AdminLayout><AdminUserDetailPage /></AdminLayout>
        </AdminRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
