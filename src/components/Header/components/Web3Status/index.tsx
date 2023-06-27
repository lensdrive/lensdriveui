import React, { useState, useEffect,useCallback } from 'react';
import { Button, Modal ,Avatar,Progress} from 'antd';
import { ConnectionRejectedError } from 'memouse-wallet';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
import useMyWallet from '@/hooks/useMyWallet';
import { useErc20 } from '@/hooks/useContract';
import { ERC20Addr } from '@/constants/address';
import { shortenAddress } from '@/utils/index';
import { toSpecialAmount, sizeTostr } from '@/utils/amount';
import  UserOutlined  from '@/assets/images/lens.png';
import { useTranslation } from 'react-i18next';
import iconPark from '@/assets/images/iconPark.png';
import earth from '@/assets/images/earth.png';
import haFill from '@/assets/images/haFill.png';
import buttonlogo from '@/assets/images/button.png';
import './index.scss';

import {useApi,useStorage,useToken} from '@/hooks/useAppState';

import { ethers } from 'ethers';
import { client, challenge, authenticate,defaultProfile } from '@/lens/api';
// import { onError } from '@apollo/client/link/error';
import { CHAIN_INFO } from '@/constants/chainInfo';
import useNetworkProvider from '@/hooks/useNetworkProvider';
import { CHAIN_IDS_TO_NAMES, DefaultChainId } from '@/constants/chains';

const Web3Status: React.FC = () => {
  const { switchChain } = useNetworkProvider();
  const [memo, setMemo] = useState(0);
  // const [disSize, setDisSize] = useState('');
  // //空间内容多少
  // const [preSize, setPreSize] = useState(0);
  const Erc20 = useErc20(ERC20Addr);
  const wallet = useMyWallet();
  const { t } = useTranslation();
  console.log(memo);

 /// lens //////////////////////////////
 const API = useApi();
 const { setLensToken, memoToken, setMemoToken, profile, setProfile,disSize, setDisSize,preSize, setPreSize}= useToken(); // lensToken,
 const {storage, setStorage} = useStorage();

 // 切换网络
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
  if (wallet.chainId !== DefaultChainId) {
    changNetWork(DefaultChainId);
  }
}, [wallet.chainId]);


 useEffect(() => {

  if (storage.Used) {
    let size = Number(storage.Free) +Number(storage.Available) || 0;
    if ((!profile) || (!profile.handle)) {
      size=size/5;
    }
    const disSize = sizeTostr(Number(storage.Used) || 0)+'/'+sizeTostr(size);
    if (size>0) {
      setPreSize(Number(storage.Used)/(size));
    }
    else {
      setPreSize(0);
    }

    setDisSize(disSize);
  } else {
    setPreSize(0);
    setDisSize('');
  }
}, [storage,profile]);

 useEffect(() => {
   if (memoToken) {
     getStorage();
   } else {
     setStorage({});
   }
 }, [memoToken]);

 useEffect(() => {
   if (wallet.status === 'connected' && wallet.chainId == DefaultChainId) {
     lensLogin();
   }
 }, [wallet.status,wallet.chainId]);

//  useEffect(() => {
//   if (wallet.status !== 'connected') {
//     activate('injected');
//   }
// }, []);





 const Login = (signatureData,signature)=>{
   API({
         method: 'POST',
         url:'lens/login',
         data: {
           // address: wallet.account,
           // accessToken,
           message:signatureData,
           signature
         }
       }).then((res) => {
        //  console.log(res.data);
         setMemoToken(res.data['access token'] || res.data['accessToken']);
         getProfile();
      });
 };

 async function getProfile() {
  try {
    /* first request the challenge from the API server 0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3  */
    const infotmp = await client.query({
      query: defaultProfile,
      variables: { address: wallet.account } // 0x48515F7d0B7280d59eCBE06d09B9EB7FEaDe73af 有handle 0xb2E06Ccf7bDBeCa3297A87cAb2bc5a22D03a2CB4
    });
    console.log('infotmp: ', infotmp);
    console.log('infotmp: ', infotmp);
    setProfile(infotmp?.data?.defaultProfile || {});
  } catch (err) {
    setProfile({});
    // console.log('Error getProfile: ', err);
  }
}
 async function lensLogin() {
   try {

     const challengeInfo = await client.query({
       query: challenge,
       variables: { address: wallet.account }
     });
     const provider = new ethers.providers.Web3Provider(window.ethereum);
     const signer = provider.getSigner();

    // console.log({text:challengeInfo.data.challenge.text});
    // console.log('text', challengeInfo.data.challenge.text);
     const signature = await signer.signMessage(challengeInfo.data.challenge.text);
     /* authenticate the user */
    // console.log('signature', signature);
     const authData = await client.mutate({
       mutation: authenticate,
       variables: {
         address: wallet.account, signature
       }
     });
     /* if user authentication is successful, you will receive an accessToken and refreshToken */
     const { data: { authenticate: { accessToken }}} = authData;
     // console.log({ accessToken });
     setLensToken(accessToken);
     Login(challengeInfo.data.challenge.text,signature);
   } catch (err) {
     console.log('Error signing in: ', err);
   }
 }
 // 获取存储空间 Used Available Free Files
 const getStorage = ()=>{
   API.get('mefs/storage')
   .then(function (res){
     if (res && res.status == 200) {
           setStorage(res.data);
       } else {
         setStorage({});
       }
   });
};
 /// lens //////////////////////////////



  const handleBalance = async () => {
    if (!Erc20) return;
    const rewardAmount = await Erc20.methods.balanceOf(wallet.account).call();
    if (rewardAmount) {
      setMemo(toSpecialAmount(rewardAmount));
    }
  };
  useEffect(() => {
    if (wallet.isConnected) {
      handleBalance();
    }
  }, [wallet.chainId, wallet.account, wallet.isConnected]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3,setIsModalOpen3] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(`${t('web.out')}`);
  const handle = () => {
    setModalText(`${t('web.Signing')}`);
    setConfirmLoading(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setConfirmLoading(false);
      wallet.reset();
    }, 2000);
  };
  const showModal = () => {
    setIsModalOpen(true);
    setModalText(`${t('web.out')}`);
  };
  const showMod = () =>{
    setIsModalOpen1(false);
    setIsModalOpen2(true);
  };
  const showModa =()=>{
    setIsModalOpen1(true);
    setIsModalOpen2(false);
  };
  //调签名
  const showMo= () =>{
    setIsModalOpen2(false);
    if (!profile.handle) {
      setIsModalOpen3(true);
    }else if (wallet.status !== 'connected') {
      activate('injected');
      // console.log(profile);
    }
  };


  // const guanbi = () => {
  //   setIsModalOpen(false);
  // };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalOpen1(false);
    setIsModalOpen2(false);
    setIsModalOpen3(false);
  };
  const handleCance =() =>{
    setIsModalOpen3(false);
    activate('injected');
  };
  const handleOk = () => {
    setIsModalOpen1(false);
  };
  const activate = (connector) => {
    wallet.connect(connector);
  };
  return (
    <>
      {(() => {
        if (wallet.error?.name) {
          return (
            <div className="connecting">
              <span className="connecting-walletError">
                {wallet.error instanceof ConnectionRejectedError
                  ? 'Connection error: the user rejected the action' : wallet.error.name
                }
              </span>
              <Button
                size="large"
                type="primary"
                onClick={() => wallet.reset()}
              >
                {t('web.Reconnect')}
              </Button>
            </div>
          );
        }

        if (wallet.status === 'connecting') {
          return (
            <div className="connecting">
              <span className="connecting-text">
                Connecting to {wallet.connector}...
              </span>
              <Button
                size="large"
                type="primary"
                onClick={() => wallet.reset()}
              >
                {t('web.Cancel')}
              </Button>
            </div>
          );
        }

        if (wallet.status === 'connected') {
          return (
            <div className="walletAccount">
              <Progress percent={preSize}
                format={() => disSize}
              />
              <div
                className="walletAccountDiv"
                onClick={showModal}
              >
               {memoToken? `${t('web.LogOut')}`: `${t('web.Sign')}`}|{shortenAddress(wallet.account, 2, 2)}
              </div>
            </div>
          );
        }

        return (
          <div>
          {/* <Button type="primary"
            size="large"
            className="connect"
            onClick={() => activate('injected')}
          >
            连接到钱包
          </Button> */}
            <Button
              type="primary"
              size="large"
              shape="round"
              className="connect"
              onClick={showModa}
            >
            <img src={buttonlogo}/>
            {t('web.Sign')}
          </Button>
          </div>
        );
      })()}

      <Modal title={<div className="iconPark"><img src={iconPark}/>{t('web.Sign')}</div>}
        open={isModalOpen1}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        // closable={false}
        style={{ top: 180 }}
      >
        <h5>{t('web.wallet')}</h5>
        <p>{t('web.one')}</p>
        <Button block
          style={{textAlign:'left',height: '50px',borderRadius:'10px',border: '1px soild #ffffff12',alignItems: 'center',justifyContent: 'space-between',display: 'flex'}}
          onClick={showMod}
        >Browser Wallet <img src={earth} style={{height:'40px'}}/></Button>
      </Modal>



      <Modal title={<div className="iconPark"><img src={iconPark}/>{t('web.Sign')}</div>}
        open={isModalOpen2}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        // closable={false}
        style={{ top: 180}}
      >
        <h5>{t('web.Please')}</h5>
        <p>{t('web.Lenster')}</p>
        <Button type="primary"
          onClick={showMo}
          style={{ textAlign: 'left' ,background:'#C9E85D',color:'#208311',borderColor:'#C9E85D',height: '36px',display: 'block',borderRadius: '10px'}}
        >{t('web.Lens')}</Button>
        <div style={{margin:'15px 0px 0px 0px',alignItems: 'center',display:'flex'}}><img src={haFill}/> <a style={{color: '#303030',marginLeft: '5px',textDecoration:'underline'}} onClick={showModa}>{t('web.Change')}</a></div>
      </Modal>

      <Modal title={<div className="iconPark"><img src={iconPark}/>{t('web.Sign')}</div>}
        open={isModalOpen3}
        onOk={handleOk}
        onCancel={handleCance}
        footer={null}
        // closable={false}
        style={{ top: 180 }}
      >
        <Avatar size={64}
          src={UserOutlined}
          style={{ margin: '0px 0px 10px' }}
        />
        <h5>{t('web.Change')} 🌿</h5>
        <p className="visite">{t('web.visite')}&nbsp;<a href="https://claim.lens.xyz" target="_blank" rel="noreferrer noopener">{t('web.claiming')}</a>&nbsp;{t('web.profile')} 🏃‍♂️</p>
        <p>{t('web.Make')}</p>
        <Button shape="round"
          style={{ borderColor:'#208311',color:'#208311' ,height: '36px',width: '110px'}}
          onClick={handleCance}>{t('web.Cancle')}</Button>
      </Modal>


      <Modal
        title={<div className="iconPark"><img src={iconPark}/>{t('web.Sign')}</div>}
        open={isModalOpen}
        onOk={handle}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={t('web.yes')}
        cancelText={t('web.No')}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  );
};

export default Web3Status;