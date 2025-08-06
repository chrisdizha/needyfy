import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// COMPLETE REWRITE - Zero dependencies on old cache
console.log('💥 COMPLETE REWRITE: Ultra-fresh start at', new Date().toISOString());

// Simple auth context inline to avoid any cache issues
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
    setIsAdmin(false);
    setUserRoles([]);
  }, []);

  const refreshAuthState = React.useCallback(async () => {
    console.log('Refreshing auth state...');
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

// Import App component dynamically to avoid cache
const App = React.lazy(() => import('./AppFresh'));

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <React.Suspense fallback={<div>Loading...</div>}>
          <App />
        </React.Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);