
// CACHE BUST - Fresh start to force Vite dev server reload
import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Minimal inline auth context to bypass cache issues
const AuthContext = React.createContext<{
  user: any;
  session: any;
  isAdmin: boolean;
  userRoles: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
  verifyAdminStatus: () => Promise<boolean>;
} | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userRoles, setUserRoles] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const signOut = React.useCallback(async () => {
    setUser(null);
    setSession(null);
  }, []);

  const refreshAuthState = React.useCallback(async () => {
    // Basic implementation
  }, []);

  const verifyAdminStatus = React.useCallback(async () => {
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, isAdmin, userRoles, loading,
      signOut, refreshAuthState, verifyAdminStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const queryClient = new QueryClient();

console.log('🔄 CACHE BUST: Fresh main.tsx loaded at', new Date().toISOString());

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
