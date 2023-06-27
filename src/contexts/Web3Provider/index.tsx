import React, { createContext } from 'react';
import { UseWalletProvider } from 'memouse-wallet';
export const Context = createContext({});

interface IProps {
  children: any
}

const Web3Provider: React.FC<IProps> = ({ children }) => {
  return (
    <UseWalletProvider
      connectors={{
        fortmatic: {
          apiKey: ''
        },
        walletconnect: {
          rpc: {
            1: 'https://mainnet.infura.io/v3/a0d8c94ba9a946daa5ee149e52fa5ff1',
            4: 'https://rinkeby.infura.io/v3/a0d8c94ba9a946daa5ee149e52fa5ff1',
            56: 'https://bsc-dataseed3.binance.org',
            1985: 'https://testchain.metamemo.one:24180/',
            985: 'https://chain.metamemo.one:8501'
          },
          bridge: 'https://bridge.walletconnect.org',
          pollingInterval: 3000
        }
      }}
      autoConnect
      pollBlockNumberInterval={3000}
      pollBalanceInterval={3000}
    >
      {children}
    </UseWalletProvider>
  );
};

export default Web3Provider;