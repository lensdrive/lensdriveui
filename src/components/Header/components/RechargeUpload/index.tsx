import React, { useEffect } from 'react';
import { Button } from 'antd';
import axios from 'axios';
import convert from 'xml-js';
import useMyWallet from '@/hooks/useMyWallet';
import useAppState from '@/hooks/useAppState';
import {toSpecialAmount} from '@/utils/amount';
import { useTranslation } from 'react-i18next';
import './index.scss';

const RechargeUpload: React.FC=() => {
  const { account, status } = useMyWallet();
  const {storageBalance, setStorageBalance} = useAppState();
  const { t } = useTranslation();
  useEffect(() => {
    if (status === 'connected') {
      getPrice();
    } else {
      setStorageBalance(0);
    }
  }, [status]);

  const getPrice = () =>{
    axios.get(`${process.env.REACT_APP_URL}/?getbalance=""&addr=${account}`)
    .then(function (res){
      let result2 = convert.xml2json(res.data, {compact: false, spaces: 2});
      let bbos= JSON.parse(result2);
      let boos = bbos.elements[0].elements[1].elements[0].text;
      setStorageBalance(boos);
    });
  };
  return (
    <>
      {
        status === 'connected' ?
          <Button
            size="large"
            type="primary"
            placeholder="abcList"
          >
            {t('Home.Storage_Balance')}{toSpecialAmount(storageBalance)}
          </Button>: ''
      }
    </>
  );
};

export default RechargeUpload;
