import useWeb3 from './useWeb3';
import { getErc20Contract, getClientHandlerContract } from '@/utils/ethereum';
import { useMemo } from 'react';

export const useErc20 = (address) => {
  const web3 = useWeb3();
  return useMemo(
    () => (address && web3 ? getErc20Contract(address, web3) : null),
    [address, web3]
  );
};

export const useClientHandler = (address) => {
  const web3 = useWeb3();
  return useMemo(
    () => (address && web3 ? getClientHandlerContract(address, web3) : null),
    [address, web3]
  );
};