import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  session: any;
  isAdmin: boolean;
  userRoles: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
  verifyAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setUserRoles([]);
  }, []);

  const refreshAuthState = useCallback(async () => {
    // Basic implementation
    console.log('Refreshing auth state...');
  }, []);

  const verifyAdminStatus = useCallback(async () => {
    return false;
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAdmin,
    userRoles,
    loading,
    signOut,
    refreshAuthState,
    verifyAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};