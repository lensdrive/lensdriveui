import React from 'react';
import AppState from '@/contexts/AppState';
import NetworkProvider from '@/contexts/NetworkProvider';
import Web3Provider from '@/contexts/Web3Provider';

interface IProps {
  children?: React.ReactNode
}

const Providers: React.FC<IProps> = ({children}) => {
  return (
    <AppState>
      <NetworkProvider>
        <Web3Provider>
          {children}
        </Web3Provider>
      </NetworkProvider>
    </AppState>
  );
};

export default Providers;