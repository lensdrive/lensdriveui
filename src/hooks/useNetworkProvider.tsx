import { useContext } from 'react';
import { Context } from '@/contexts/NetworkProvider';

const useNetworkProvider = () => {
  const { switchChain, chainId } = useContext(Context);
  return { switchChain, chainId };
};

export default useNetworkProvider;