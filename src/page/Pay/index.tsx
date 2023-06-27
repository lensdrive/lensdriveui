import React, { useState ,useEffect, useCallback} from 'react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import { Button, InputNumber, message } from 'antd';
import useWeb3 from '@/hooks/useWeb3';
import useAppState from '@/hooks/useAppState';
import useMyWallet from '@/hooks/useMyWallet';
import { useErc20, useClientHandler } from '@/hooks/useContract';
import { ERC20Addr, ClientHandlerAddr } from '@/constants/address';
import { fromAmount, toSpecialAmount } from '@/utils/amount';
import { useTranslation } from 'react-i18next';
import './index.scss';
const RATE = 10;
const Recharge: React.FC = () => {
  const { t } = useTranslation();
  const web3 = useWeb3();
  const wallet = useMyWallet();
  const { storageBalance, setStorageBalance } = useAppState();
  const Erc20 = useErc20(ERC20Addr);
  const ClientHandler = useClientHandler(ClientHandlerAddr);
  const [goldList] = useState([10, 20, 100, 300, 500, 1000]);
  const [size, setSize] = useState(0);
  const [otherStorage, setOtherStorage] = useState(null);
  const [moneys, setMoneys] = useState(0);
  const [memo, setMemo] = useState(0);
  const [loadings, setLoadings] = useState(false);

  useEffect(() => {
    if(wallet.isConnected){
      handleBalance();
    }
  }, [wallet.chainId, wallet.account,wallet.isConnected]);

  const handleBalance = async () => {
    if (!Erc20) return;
    const rewardAmount = await Erc20.methods.balanceOf(wallet.account).call();
    if (rewardAmount) {
      setMemo(toSpecialAmount(rewardAmount));
    }
  };

  const selectStorage = (item: any) => {
    setOtherStorage(null);
    setSize(item);
    setMoneys(1 * item / RATE);
  };

  const blurInput = (val: any) => {
    if (val < 1) {
      message.error(`${t('pay.Please_enter')}`);
      setOtherStorage(null);
      setSize(0);
      setMoneys(0);
      return;
    }
    setOtherStorage(val);
    setSize(val);
    setMoneys(val / RATE);
  };

  const blurMoneyInput = (val: any) => {
    if(!val) {
      message.error(`${t('pay.Please_enter')}`);
      setOtherStorage(null);
      setSize(0);
      setMoneys(0);
      return;
    }
    setOtherStorage(val*RATE);
    setSize(val*RATE);
    setMoneys(val);
  };

  const onRecharge = () => {
    if (!moneys) {
      message.error(`${t('pay.Invalid_amount')}`);
      setOtherStorage(null);
      setSize(0);
      setMoneys(0);
      return;
    }
    if (moneys < 0.01) {
      message.error(`${t('pay.The_minimum')}`);
      setOtherStorage(null);
      setSize(0);
      setMoneys(0);
      return;
    }
    if (moneys >memo){
      message.error(`${t('pay.Insufficient_balance')}`);
      setOtherStorage(null);
      setSize(0);
      setMoneys(0);
      return;
    } else {
      deposit(moneys);
    }
  };

  const deposit = useCallback(
    async (money) => {
      setLoadings(true);
      try {
        await Erc20.methods.approve(ClientHandlerAddr, fromAmount(money)).send({ from: wallet.account });
        await ClientHandler.methods.deposit(fromAmount(money)).send({ from: wallet.account });
        setOtherStorage('');
        setSize(0);
        setMoneys(0);
        getBalanceOf();
        setLoadings(false);
      } catch (e) {
        setOtherStorage('');
        setMoneys(0);
        setSize(0);
        setLoadings(false);
      }
    },
    [web3, ClientHandlerAddr]
  );

  // 获取余额方法
  const getBalanceOf = useCallback(
    async () => {
      try {
        const balanceOf = await ClientHandler.methods.balanceOf(wallet.account).call({ from: wallet.account });
        setStorageBalance(balanceOf);
      } 
      catch (e) {
        console.log(e);
      }
    },
    [web3, ClientHandlerAddr, storageBalance]
  );

  return (
    <>
      <div className="Recharge">
        <Header />
        <div className="container">
          <div className="Recharge_home">
            <ul>
              {goldList.map((item: any, index) => {
                return (
                  <li
                    onClick={() => selectStorage(item)}
                    key={index}
                    className="goldList"
                  >
                    <Button block>{item}G</Button>
                  </li>
                );
              })}
            </ul>
            <InputNumber
              placeholder={t('pay.Customize_your')}
              value={otherStorage}
              onChange={
                (val) => { blurInput(val); }
              }
              className="Number"
            />
            <p className="NumberP">*{t('pay.Minimum_storage_space')}&nbsp;&nbsp;{t('pay.Balance_to_top-up')}<a>{memo}&nbsp;MEMO</a></p>
            <p className="RechargeP">{t('pay.Storage_space')}<a>{size}&nbsp;G</a>,{t('pay.Estimated_cost')}</p>
            <InputNumber
              placeholder={t('pay.Estimated_Cost')}
              value={moneys}
              onChange={
                (val) => { blurMoneyInput(val); }
              }
              className="blurMoney"
            />
            <Button
              type="primary"
              shape="round"
              className="primary"
              onClick={() => onRecharge()}
              loading={loadings}

            >
              {t('Top-up')}
            </Button>
          </div>
        </div>
        <TabBar />
      </div>
    </>
  );
};

export default Recharge;
