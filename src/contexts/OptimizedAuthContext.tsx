
import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { getDeviceFingerprint } from '@/components/security/SecurityEnhancements'

interface AuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  userRoles: string[]
  loading: boolean
  signOut: () => Promise<void>
  refreshAuthState: () => Promise<void>
  verifyAdminStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const OptimizedAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const verifyAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { action: 'verify' }
      })
      
      if (error) {
        console.error('Admin verification error:', error)
        return false
      }
      
      return data?.admin === true
    } catch (error) {
      console.error('Admin verification failed:', error)
      return false
    }
  }, [])

  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_roles', { _user_id: userId })
      
      if (error) {
        console.error('Error fetching user roles:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Failed to fetch user roles:', error)
      return []
    }
  }, [])

  const refreshAuthState = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        setUser(null)
        setSession(null)
        setIsAdmin(false)
        setUserRoles([])
        return
      }

      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        const deviceFingerprint = getDeviceFingerprint()
        localStorage.setItem('device_fingerprint', deviceFingerprint)
        
        try {
          const roles = await fetchUserRoles(session.user.id)
          setUserRoles(roles)
          
          const adminStatus = roles.includes('admin')
          setIsAdmin(adminStatus)
          
          if (adminStatus) {
            try {
              const backendVerified = await verifyAdminStatus()
              setIsAdmin(backendVerified)
            } catch (error) {
              console.error('Admin verification failed, keeping local status:', error)
            }
          }
        } catch (error) {
          console.error('Failed to fetch user roles during auth refresh:', error)
          setUserRoles([])
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
        setUserRoles([])
        localStorage.removeItem('device_fingerprint')
        localStorage.removeItem('active_sessions')
      }
    } catch (error) {
      console.error('Failed to refresh auth state:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchUserRoles, verifyAdminStatus])

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('device_fingerprint')
      localStorage.removeItem('active_sessions')
      localStorage.removeItem('security_events')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        toast.error('Failed to sign out')
        return
      }
      
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setUserRoles([])
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out failed:', error)
      toast.error('Failed to sign out')
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          setTimeout(async () => {
            const deviceFingerprint = getDeviceFingerprint()
            localStorage.setItem('device_fingerprint', deviceFingerprint)
            
            try {
              const roles = await fetchUserRoles(session.user.id)
              setUserRoles(roles)
              
              const adminStatus = roles.includes('admin')
              setIsAdmin(adminStatus)
              
              if (adminStatus) {
                try {
                  const backendVerified = await verifyAdminStatus()
                  setIsAdmin(backendVerified)
                } catch (error) {
                  console.error('Admin verification failed during auth change:', error)
                }
              }
            } catch (error) {
              console.error('Failed to fetch user roles during auth state change:', error)
              setUserRoles([])
              setIsAdmin(false)
            }
          }, 0)
        } else {
          setIsAdmin(false)
          setUserRoles([])
          localStorage.removeItem('device_fingerprint')
          localStorage.removeItem('active_sessions')
        }
        
        setLoading(false)
      }
    )

    refreshAuthState()

    const sessionTimeout = setInterval(() => {
      if (session && session.expires_at) {
        const now = Math.floor(Date.now() / 1000)
        const expiresAt = session.expires_at
        
        if (expiresAt - now < 300) {
          toast.warning('Your session will expire soon. Please refresh the page to continue.')
        }
        
        if (expiresAt < now) {
          toast.error('Your session has expired. Please sign in again.')
          signOut()
        }
      }
    }, 60000)

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionTimeout)
    }
  }, [session, refreshAuthState, signOut, fetchUserRoles, verifyAdminStatus])

  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    isAdmin,
    userRoles,
    loading,
    signOut,
    refreshAuthState,
    verifyAdminStatus
  }), [user, session, isAdmin, userRoles, loading, signOut, refreshAuthState, verifyAdminStatus])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
