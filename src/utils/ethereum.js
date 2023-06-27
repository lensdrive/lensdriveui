import Web3 from 'web3';
import Erc20 from '@/contracts/Erc20.json';
import ClientHandler from '@/contracts/clientHandler.json';
import {
  ERC20Addr,
  ClientHandlerAddr
} from '@/constants/address';

export const getContract = (abi, address, web3) => {
  const _web3 = web3 ?? new Web3();
  return new _web3.eth.Contract(abi, address);
};

export const getErc20Contract = (address, web3) => {
  return getContract(Erc20, address, web3);
};

export const getErc20AddrContract = (web3) => {
  return getContract(ERC20Addr, web3);
};

export const getClientHandlerContract = (address, web3) => {
  return getContract(ClientHandler.abi, address, web3);
};

export const getClientHandAddrContract = (web3) => {
  return getContract(ClientHandlerAddr, web3);
};

export default getContract;