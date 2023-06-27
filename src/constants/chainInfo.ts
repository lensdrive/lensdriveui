import { SupportedChainId } from './chains';
export const NetworkType = {
  L1: 0,
  L2: 1
};

export const CHAIN_INFO = {
  [SupportedChainId.MATIC]: {
    networkType: NetworkType.L2,
    explorer: 'https://polygonscan.com/',
    label: 'MATIC MainNet',
    rpcUrls: ['https://polygon.llamarpc.com'],
    logoUrl: '',
    nativeCurrency: {
      name: 'Polygon Matic',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  [SupportedChainId.MATIC_TEST]: {
    networkType: NetworkType.L2,
    explorer: '',
    label: 'Polygon Testnet',
    rpcUrls: ['https://rpc.public.zkevm-test.net'],
    logoUrl: '',
    nativeCurrency: {
      name: 'Polygon zkEVM Testnet',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  [SupportedChainId.BSC]: {
    networkType: NetworkType.L1,
    explorer: 'https://bscsan.com',
    label: 'BSC',
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    logoUrl: '',
    nativeCurrency: {
      name: 'Polygon Matic',
      symbol: 'BNB',
      decimals: 18
    }
  },
  [SupportedChainId.BSC_TEST]: {
    networkType: NetworkType.L2,
    explorer: 'https://testnet.bscscan.com',
    label: 'BSC Test',
    logoUrl: '',
    rpcUrls:['https://data-seed-prebsc-2-s2.binance.org:8545'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  [SupportedChainId.MEMO]: {
    networkType: NetworkType.L1,
    explorer: 'https://scan.metamemo.one:8080/',
    label: 'MEMO',
    logoUrl: '',
    rpcUrls:['https://chain.metamemo.one:8501'],
    nativeCurrency: {
      name: 'ABBAS MEMO',
      symbol: 'MEMO',
      decimals: 18
    }
  },
  [SupportedChainId.DEVMEMO]: {
    networkType: NetworkType.L1,
    explorer: 'https://devchain.metamemo.one:8080/',
    label: 'DEV MEMO',
    logoUrl: '',
    rpcUrls:['https://devchain.metamemo.one:8501'],
    nativeCurrency: {
      name: 'ABBAS MEMO',
      symbol: 'MEMO',
      decimals: 18
    }
  },
  [SupportedChainId.MEMO_TEST]: {
    networkType: NetworkType.L1,
    explorer: 'https://testscan.metamemo.one:8080/',
    label: 'TEST MEMO',
    logoUrl: '',
    rpcUrls:['https://testchain.abbas.network:24180/'],
    nativeCurrency: {
      name: 'ABBAS MEMO',
      symbol: 'MEMO',
      decimals: 18
    }
  }
};