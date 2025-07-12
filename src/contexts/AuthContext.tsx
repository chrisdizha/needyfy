import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const verifyAdminStatus = async (): Promise<boolean> => {
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
  }

  const fetchUserRoles = async (userId: string) => {
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
  }

  const refreshAuthState = async () => {
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
        // Fetch user roles
        const roles = await fetchUserRoles(session.user.id)
        setUserRoles(roles)
        
        // Check admin status
        const adminStatus = roles.includes('admin')
        setIsAdmin(adminStatus)
        
        // Double-check with backend for critical admin operations
        if (adminStatus) {
          const backendVerified = await verifyAdminStatus()
          setIsAdmin(backendVerified)
        }
      } else {
        setIsAdmin(false)
        setUserRoles([])
      }
    } catch (error) {
      console.error('Failed to refresh auth state:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
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
  }

  useEffect(() => {
    // Initial session check
    refreshAuthState()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          // Refresh roles when user signs in
          const roles = await fetchUserRoles(session.user.id)
          setUserRoles(roles)
          
          const adminStatus = roles.includes('admin')
          setIsAdmin(adminStatus)
          
          if (adminStatus) {
            const backendVerified = await verifyAdminStatus()
            setIsAdmin(backendVerified)
          }
        } else {
          setIsAdmin(false)
          setUserRoles([])
        }
        
        setLoading(false)
      }
    )

    // Session timeout handler (30 minutes)
    const sessionTimeout = setInterval(() => {
      if (session && session.expires_at) {
        const now = Math.floor(Date.now() / 1000)
        const expiresAt = session.expires_at
        
        // If session expires in 5 minutes, show warning
        if (expiresAt - now < 300) {
          toast.warning('Your session will expire soon. Please refresh the page to continue.')
        }
        
        // If session is expired, sign out
        if (expiresAt < now) {
          toast.error('Your session has expired. Please sign in again.')
          signOut()
        }
      }
    }, 60000) // Check every minute

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionTimeout)
    }
  }, [session])

  const value: AuthContextType = {
    user,
    session,
    isAdmin,
    userRoles,
    loading,
    signOut,
    refreshAuthState,
    verifyAdminStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}