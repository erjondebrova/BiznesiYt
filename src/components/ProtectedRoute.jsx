import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Zap } from 'lucide-react'

export default function ProtectedRoute({ children, skipOnboardingCheck = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm text-gray-400">Duke u ngarkuar...</div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth/login" replace />

  if (!skipOnboardingCheck) {
    const onboardingDone = sessionStorage.getItem('onboarding_done') === '1'
    if (!onboardingDone && profile && !profile.onboarding_completed) {
      return <Navigate to="/onboarding" replace />
    }
  }

  return children
}
