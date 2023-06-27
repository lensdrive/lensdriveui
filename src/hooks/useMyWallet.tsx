import { useWallet } from 'memouse-wallet';

const useMyWallet = () => {
  const wallet = useWallet();
  return wallet;
};

export default useMyWallet;