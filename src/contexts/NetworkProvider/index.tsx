import React, { createContext, useCallback, useState } from 'react';
import { DefaultChainId } from '@/constants/chains';
export const Context = createContext({switchChain: null, chainId: null, setChainId: null});

interface IProps {
  children: any
}

const NetworkProvider: React.FC<IProps> = ({children}) => {
  const [chainId, setChainId] = useState(DefaultChainId);
  const switchChain = useCallback(
    async ({ chainId, chainName, nativeCurrency, rpcUrls, explorerUrl}) => {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        });
      } catch (e: any) {
        if (e.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId,
                chainName,
                nativeCurrency,
                rpcUrls,
                blockExplorerUrls: [explorerUrl]
              }]
            });
          } catch (addError) {
            console.log(addError);
          }
        }
      }
    },
    []
  );
  return (
    <Context.Provider
      value={{
        switchChain: switchChain,
        chainId,
        setChainId
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default NetworkProvider;