import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallbackPath?: string
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) => {
  const { user, isAdmin, loading, verifyAdminStatus } = useAuth()
  const [adminVerified, setAdminVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const verifyAdmin = async () => {
      if (requireAdmin && user && isAdmin) {
        setVerifying(true)
        try {
          // Double-check admin status with backend
          const verified = await verifyAdminStatus()
          setAdminVerified(verified)
        } catch (error) {
          console.error('Admin verification failed:', error)
          setAdminVerified(false)
        } finally {
          setVerifying(false)
        }
      }
    }

    verifyAdmin()
  }, [requireAdmin, user, isAdmin, verifyAdminStatus])

  if (loading || verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />
  }

  if (requireAdmin && !adminVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}