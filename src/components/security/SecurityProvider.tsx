import { ReactNode } from 'react';

interface SecurityProviderProps {
  children: ReactNode;
}

// Minimal no-op SecurityProvider to avoid hook errors in environments without full React context
export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  return <>{children}</>;
};
