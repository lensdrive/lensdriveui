import React,{useCallback,useEffect} from 'react';
// import NetworkSelector from '@/components/Header/components/NetworkSelector';
// import { useNavigate } from 'react-router-dom';
// import Web3Status from '@/components/Header/components/Web3Status';
import UserAvatar from '@/components/Header/components/UserAvatar';
import useMyWallet from '@/hooks/useMyWallet';
import {useToken} from '@/hooks/useAppState';
import { Button } from 'antd';
// import RechargeUpload from '@/components/Header/components/RechargeUpload';
// import LanguageSwitching from '@/components/Header/components/LanguageSwitching';
import logo from '@/assets/images/logo.png';
// import { Post } from '@/lens/api'; 
// import { useTranslation } from 'react-i18next';
import './index.scss';

const HeaderPage: React.FC = () => {
  // const { t } = useTranslation();
  // const navigate = useNavigate();
  // const goRecharge = () => {
  //   navigate('/Pay');
  // };
  // const goHome = () => {
  //   navigate('/');
  // };
  const wallet = useMyWallet();
  const { memoToken, profile, receive, setReceive }= useToken(); // lensToken ,lensclient 


  useEffect(() => {
    if (wallet.status === 'connected') {
      setReceive(getLocalValue('Receive'+ wallet.account));
    }
  }, [ wallet.account,receive ]);

const setLocalValue = (key, value)=> {
    if (window && window.localStorage) {
      try {
       window.localStorage.setItem(key, JSON.stringify(value));
      /*
       lensclient.mutate({
        mutation: Post,
        variables: {
          request:{
            profileId: profile.id,
            contentURI: 'ar://7lZAwdJin6k7guQDeW5rT_nl3nKhpyZGnwQNjpqlXZo',
            collectModule: {
              freeCollectModule: { followerOnly: true }
              // revertCollectModule: true
            },
            referenceModule: {
              followerOnlyReferenceModule: false
            }
          }
        },
        context: {
          headers: {
            'x-access-token': `Bearer ${lensToken}`
          }
        }
       
      }); */

       setReceive(true);
      } catch (err) {
         console.log(err);
        setReceive(false);
     }
    }
  };
  const getLocalValue = useCallback((key) =>{
    if (window && window.localStorage) {
      if (!window.localStorage.getItem(key)) {
        return false;
      }
      try {
        return JSON.parse(window.localStorage.getItem(key));
      } catch (err) {
         return false;
      }
    } else {
      return false;
    }
  },[receive]);

  return (
    <>
    {
      ( (!getLocalValue('Receive'+wallet.account)) && profile?.handle && memoToken && wallet.status === 'connected')?
          <div className="Header">Please check to distribute 10.0G space to your account !
            <Button type="primary" shape="round"  onClick={() => setLocalValue('Receive'+wallet.account,true)}>
            Receive
            </Button>
          </div>
      : ''
    }
      <div className="HeaderPage">
        <div className="head">
          <div className="container">
            <div className="head-left">
              <div><img src={logo} /></div>
              {/* <ul>

                <li onClick={goHome}
                  className="Top"
                >{t('Upload')}</li>
                <li
                  onClick={goRecharge}
                  className="Files"
                >{t('Top-up')}</li>
              </ul> */}
            </div>
            <div className="head-right">
              {/* <RechargeUpload /> */}
              {/* <NetworkSelector/> */}
              {/* <Web3Status /> */}
              <UserAvatar/>
              {/* <LanguageSwitching/> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderPage;