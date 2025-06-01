import React from 'react';
import { RainbowProvider } from './rainbow-provider';
import { SiweProvider } from './siwe-provider';

const DidAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <RainbowProvider>
      <SiweProvider>{children}</SiweProvider>
    </RainbowProvider>
  );
};

export default DidAuthProvider;
