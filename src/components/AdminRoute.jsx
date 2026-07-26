import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400 text-sm">Duke u ngarkuar...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth/login" replace />
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />

  return children
}
