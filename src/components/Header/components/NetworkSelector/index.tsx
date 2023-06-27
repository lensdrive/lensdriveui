import React,{useCallback,useEffect} from 'react';
import { Button } from 'antd';
import useMyWallet from '@/hooks/useMyWallet';
import { CHAIN_INFO } from '@/constants/chainInfo';
import useNetworkProvider from '@/hooks/useNetworkProvider';
import { CHAIN_IDS_TO_NAMES, DefaultChainId } from '@/constants/chains';
import './index.scss';

const NetworkSelector: React.FC = () => {
  let { chainId, status } = useMyWallet();

  const { switchChain } = useNetworkProvider();
	if (status !== 'connected') {
   //  chainId = DefaultChainId;
  }
	const changNetWork = useCallback((event) => {
		const tmpChainId = 1 * event;
		const chain = CHAIN_INFO[tmpChainId];
		switchChain({
			chainId: '0x' + tmpChainId.toString(16),
			chainName: CHAIN_IDS_TO_NAMES[tmpChainId],
			nativeCurrency: chain.nativeCurrency,
			rpcUrls: chain.rpcUrls,
			explorerUrl: chain.explorer
		});
	}, []);

  useEffect(() => {
    if (status === 'connected') {
      changNetWork(DefaultChainId);
    }
  }, [status]);

  return (
    <>
      <div className="Network">
        <Button type="primary"
          className="primary"
          size="large"
        >
          {CHAIN_INFO[chainId].label}
          <img src={CHAIN_INFO[chainId].logoUrl}/>
        </Button>
      </div>
    </>
  );
};

export default NetworkSelector;