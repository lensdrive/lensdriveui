import { useMemo } from 'react';
import { useWallet } from 'memouse-wallet';
import Web3 from 'web3';

const useWeb3 = () => {
  const { chainId, ethereum } = useWallet();

  const web3 = useMemo(() => {
    if (ethereum && chainId) {
      return new Web3(ethereum);
    }
    return null;
  }, [ethereum, chainId]);
  return web3;
};

export default useWeb3;