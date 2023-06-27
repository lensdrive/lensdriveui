import React, { useState, useEffect,useCallback } from 'react';
import { Button, Modal ,Avatar,Dropdown} from 'antd';
import { ConnectionRejectedError } from 'memouse-wallet';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
import type { MenuProps} from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import useMyWallet from '@/hooks/useMyWallet';
import { useErc20 } from '@/hooks/useContract';
import { ERC20Addr } from '@/constants/address';
import { toSpecialAmount ,sizeTostr} from '@/utils/amount';
import  UserOutlined  from '@/assets/images/lens.png';
import { useTranslation } from 'react-i18next';
import iconPark from '@/assets/images/iconPark.png';
import sculpture from '@/assets/images/sculpture.jpg';
import ModalBackground from '@/assets/images/ModalBackground.png';
import ModalLens from '@/assets/images/ModalLens.png';
// import earth from '@/assets/images/earth.png';
// import haFill from '@/assets/images/haFill.png';
import buttonlogo from '@/assets/images/button.png';
import tui from '@/assets/images/tui.png';
import changingOver from '@/assets/images/changingOver.png';
import './index.scss';

import {useApi,useStorage,useToken} from '@/hooks/useAppState';

import { ethers } from 'ethers';
import { ApolloClient ,InMemoryCache } from '@apollo/client';
import { challenge, authenticate,Profiles } from '@/lens/api'; //defaultProfile
// import { onError } from '@apollo/client/link/error';
import { CHAIN_INFO } from '@/constants/chainInfo';
import useNetworkProvider from '@/hooks/useNetworkProvider';
import { CHAIN_IDS_TO_NAMES, DefaultChainId } from '@/constants/chains';


const Web3Status: React.FC = () => {
  const { switchChain } = useNetworkProvider();
  const [memo, setMemo] = useState(0);
  const Erc20 = useErc20(ERC20Addr);
  const wallet = useMyWallet();
  const { t } = useTranslation();
  console.log(memo);

 /// lens //////////////////////////////
 const API = useApi();
 const { setLensToken, memoToken, setMemoToken, profile, setProfile, profiles,  setProfiles, setDisSize, setPreSize, setLensclient}= useToken(); // lensToken,
 const {storage, setStorage} = useStorage();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isModalOpen1, setIsModalOpen1] = useState(false);
 const [isModalOpen2, setIsModalOpen2] = useState(false);
 const [isModalOpen3,setIsModalOpen3] = useState(false);
 const [isModalOpen4,setIsModalOpen4] = useState(false);
 const [getprofileOK,setGetprofileOK] = useState(false);
 const [confirmLoading, setConfirmLoading] = useState(false);
 const [lensdriveLoading,setLensdriveLoading] = useState(false);
 const [visibility,setVisibility] = useState(true);
 
 const [modalText, setModalText] = useState(`${t('web.out')}`);
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

//账户改变，先清空
useEffect(() => {
  setProfile({});
}, [ wallet.account]);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      setVisibility(true);
    } else {
      setVisibility(false);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

useEffect(() => {
if(wallet.chainId !== DefaultChainId){
  if (visibility) {
    changNetWork(DefaultChainId);
  }
  // setProfile({});
}

}, [wallet.chainId,visibility]);


// 计算存储空间
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


 useEffect(() => {
   if (wallet.status === 'connected' && wallet.chainId == DefaultChainId) {
     lensLogin();
   }
 }, [wallet.status,wallet.chainId]);

 useEffect(() => {
  if (getprofileOK) {
    if (wallet.status === 'connected' && (!profile) || (!profile.handle)) {
      setIsModalOpen3(true);
    }
    setIsModalOpen2(false);
    setGetprofileOK(false);
  }
}, [getprofileOK, profile]);


 const Login =async (signatureData,signature)=>{
   API({
         method: 'POST',
         url:'lens/login',
         data: {
           // address: wallet.account,
           // accessToken,
           message:signatureData,
           signature
         }
       }).then(async (res) => {
        //  console.log(res.data);
         setMemoToken(res.data['access token'] || res.data['accessToken']);
         await getProfile();
      });
 };

 async function getProfile() {
  try {
    /* first request the challenge from the API server 0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3  */
    const client = new ApolloClient({
      uri: 'https://api.lens.dev',
      cache: new InMemoryCache()
    });
    // const infotmp = await client.query({
    //   query: defaultProfile,
    //   variables: { address: wallet.account } // 0x48515F7d0B7280d59eCBE06d09B9EB7FEaDe73af 有handle 0xb2E06Ccf7bDBeCa3297A87cAb2bc5a22D03a2CB4
    // });

    const infotmp2 = await client.query({
      query: Profiles,
      variables: { address: [wallet.account] } // 0x48515F7d0B7280d59eCBE06d09B9EB7FEaDe73af 有handle 0xb2E06Ccf7bDBeCa3297A87cAb2bc5a22D03a2CB4
    });
    console.log('infotmp2: ', infotmp2);

    const tmpprofiles = infotmp2?.data?.profiles?.items || [];
    setProfiles(tmpprofiles);
    console.log(tmpprofiles);

    let hasDefault= false;
    tmpprofiles.forEach(item => {
      if (item.isDefault) {
        hasDefault=true;
        setProfile(JSON.parse(JSON.stringify(item)));
      }
    });
    if (!hasDefault) {
      if (!tmpprofiles.length) {
        setProfile({});
      } else {
        setProfile(JSON.parse(JSON.stringify(tmpprofiles[0])));
      }
    }
    // console.log('infotmp: ', infotmp);
    // console.log('infotmp: ', infotmp);
    // setProfile(infotmp?.data?.defaultProfile || {});
    setGetprofileOK(true);
  } catch (err) {
    setProfile({});
    setProfiles([]);
    setGetprofileOK(true);
    // console.log('Error getProfile: ', err);
  }
}

console.log('memo',getprofileOK == false);

 async function lensLogin() {
   try {
    const client = new ApolloClient({
      uri: 'https://api.lens.dev',
      cache: new InMemoryCache()
    });
    
    setLensclient(client);

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
     await setLensToken(accessToken);
     await Login(challengeInfo.data.challenge.text,signature);
     setLensdriveLoading(false);
   } catch (err) {
     console.log('Error signing in: ', err);
     setLensdriveLoading(false);
   }
 }
 // 获取存储空间 Used Available Free Files

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
  const showModals = () =>{
    setIsModalOpen4(true);
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
    setLensdriveLoading(true);
    // setIsModalOpen2(false);
    activate('injected');
    // console.log(isModalOpen3);
    /*
    if (!profile.handle) {
      setIsModalOpen3(true);
    }else if (wallet.status !== 'connected') {
      activate('injected');
      // console.log(profile);
    }
    */
  };
  const handleString = profile?.handle || '';
  const handle1 = handleString.replace(/\.[a-zA-Z]+\b/g, '');
  const items: MenuProps['items'] = [
    {
      label: profile?.handle &&   <div className="items_label">Logged in as<span className="LeftList_handle">@{handle1}</span></div>,
      key: '0'
    },
    {
      type: 'divider'
    },
    {
      label: profile?.handle &&   <Button  style={{display:'flex',height:'40px',width:'100%',paddingLeft:'5px',alignItems:'center',borderRadius:'5px'}} className="items_label2" onClick={showModals}><img src={changingOver}/>{t('web.Switch_Profile')}</Button>,
      key: '3'
    },
    {
      label: <div className="items_label1" onClick={showModal}><img src={tui}/>{t('web.Logout')}</div>,
      key: '5'
    },
    {
      type: 'divider'
    },
    {
      label: <div className="items_label3">V0.2</div>,
      key: '7'
    }
  ];


  // const guanbi = () => {
  //   setIsModalOpen(false);
  // };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalOpen1(false);
    setIsModalOpen2(false);
    setIsModalOpen3(false);
    setIsModalOpen4(false);
  };
  const handleCance =() =>{
    setIsModalOpen3(false);
    // activate('injected');
  };
  const handleOk = () => {
    setIsModalOpen1(false);
  };
  const handleSwitch = (index,isame) => {
    if (isame) return;
    if (index > profiles.length) return;
    setProfile(JSON.parse(JSON.stringify(profiles[index])));
    setIsModalOpen4(false);
  };
  const activate = (connector) => {
    wallet.reset();
    wallet.connect(connector);

  };

  const urlString = (profile?.picture?.original?.url) || '';
  const url = urlString.replace(/:/g, '');
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
              <Dropdown menu={{ items }} trigger={['click']}>
              <Avatar  size={36}  src={profile?.handle?'https://user-content.lenster.xyz/300x300/https://gateway.ipfscdn.io/'+url:sculpture} />
              </Dropdown>
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
      {/* 弹出框弹出可选择钱包链接 */}
      {/* <Modal title={<div className="iconPark"><img src={iconPark}/>{t('web.Sign')}</div>}
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
      </Modal> */}
      <Modal title={<div ><img className="iconPark" src={ModalLens}/></div>}
        open={isModalOpen1}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        // closable={false}
        style={{ top: 180 }}
        bodyStyle={{padding:'40px 24px 40px'}}
      >
        <h5>{t('web.wallet')}</h5>
        <p style={{textAlign:'center'}}>{t('web.one')}<span style={{color:'#389220'}}>Lens</span>{t('web.one2')}<span style={{color:'#389220'}}>10G</span>{t('web.one4')}</p>
        <Button block
          style={{height: '40px',borderRadius:'40px',backgroundColor:'#389220 ',color:'#fff',border: '1px soild #ffffff12',alignItems: 'center',justifyContent: 'center',display: 'flex',borderWidth: '0px'}}
          onClick={showMod}
        >Browser Wallet</Button>
      </Modal>


      <Modal title={<div ><img className="iconPark" src={ModalBackground}/></div>}
        open={isModalOpen2}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        // closable={false}
        style={{ top: 180}}
        bodyStyle={{padding:'40px 24px 40px'}}
      >
        <h5>{t('web.Please')}</h5>
        <p style={{textAlign:'center'}}>{t('web.Lenster')}</p>
        <Button type="primary"
          loading={lensdriveLoading == true}
          onClick={showMo}
          style={{ textAlign: 'center' ,background:'#389220',color:'#fff',borderColor:'#C9E85D',height: '40px',width:'100%',display: 'block',borderRadius: '40px'}}
        >{t('web.Lens')}</Button>
      </Modal>

      <Modal
        open={isModalOpen3}
        onOk={handleOk}
        onCancel={handleCance}
        footer={null}
        // closable={false}
        style={{ top: 180 }}
        bodyStyle={{padding:'40px 24px 40px'}}
      >
        <div style={{textAlign:'center'}}>
        <Avatar size={112}
          src={UserOutlined}
          style={{ margin: '0px 0px 10px' ,textAlign:'center'}}
        />
        </div>
        <h5>{t('web.Change')}</h5>
        <p className="visite">{t('web.visite')}&nbsp;<a href="https://claim.lens.xyz" target="_blank" rel="noreferrer noopener">{t('web.claiming')}</a>&nbsp;{t('web.profile')}</p>
        <div style={{display:'flex',justifyContent:'space-between'}}>
        <Button shape="round"
          style={{ borderColor: '#389220',backgroundColor:'#389220', color: '#fff', height: '40px', width: '44%' }}
          onClick={()=>{const w=window.open('about:blank');w.location.href='https://claim.lens.xyz/';}}>{t('web.Confirm')}</Button>
        <Button shape="round"
          style={{ backgroundColor: '#F4F4F5',borderColor: '#F4F4F5', color: '#71717A', height: '40px', width: '44%' }}
          onClick={handleCance}>{t('web.Cancle')}</Button>
          </div>
      </Modal>

      <Modal
        title={<div className="iconP">{t('web.Change_Profile')}</div>}
        open={isModalOpen4}
        onOk={handle}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={null}
        width={400}
        bodyStyle={{padding:'10px'}}
      >
        <>
        {
          profiles.map((item,index) => {
            return (
                    <Button className="LeftList_Avatar"  key={item.name} onClick={() => handleSwitch(index,item.name ==profile.name)} style={{justifyContent:'space-between',width:'100%',display:'flex',height:'45px',alignItems: 'center',marginBottom: '10px',paddingLeft:'10px',borderRadius:'10px'}}>
                      <span>
                    <Avatar style={{marginRight:'7px'}} size={30}  src={'https://user-content.lenster.xyz/300x300/https://gateway.ipfscdn.io/'+((item?.picture?.original?.url) || '').replace(/:/g, '')} />
                    {item.name}</span>
                    {(item.name ==profile.name) && <span> <CheckCircleTwoTone twoToneColor="#52c41a" /></span>}
                    </Button>
            );
          })
        }
        {/* <p><span><Avatar className="LeftList_Avatar" shape="square" size={30}  src={'https://user-content.lenster.xyz/300x300/https://gateway.ipfscdn.io/'+url} /> {profile.name}</span></p> */}
        </>
      </Modal>
      <Modal
        title={<div className="iconPa"><img src={iconPark}/>{t('web.LogOut')}</div>}
        open={isModalOpen}
        onOk={handle}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={t('web.yes')}
        cancelText={t('web.No')}
        bodyStyle={{padding:'40px 24px 40px'}}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  );
};

export default Web3Status;