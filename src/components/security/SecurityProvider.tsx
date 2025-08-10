import type { PropsWithChildren } from 'react';

// Super-minimal passthrough provider with no runtime React dependency or hooks
export const SecurityProvider = ({ children }: PropsWithChildren<{}>) => {
  return children as any;
};
