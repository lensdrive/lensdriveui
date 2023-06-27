import React,{useMemo} from 'react';
import {useToken} from '@/hooks/useAppState';
import { Avatar ,Progress}  from 'antd';
import LanguageSwitching from '@/components/Header/components/LanguageSwitching';

import { useTranslation } from 'react-i18next';
// import faviconV2 from '@/assets/images/faviconV2.png';
import { shortenFileName } from '@/utils/index';
import useMyWallet from '@/hooks/useMyWallet';
import riLine from '@/assets/images/riLine.png';
import Well from '@/assets/images/Well.png';
import riLinewallet from '@/assets/images/riLinewallet.png';
import stTriangle from '@/assets/images/st_triangle.png';
import '@/components/LeftList/index.scss';



function LeftList() {
  const  {profile,disSize,preSize,receive}= useToken();
  const wallet = useMyWallet();
  const { t } = useTranslation();
  console.log('存储'+disSize);
  console.log('存储'+preSize);
  const urlString = (profile?.picture?.original?.url) || '';
  const url = urlString.replace(/:/g, '');
  const handleString = profile?.handle || '';
  const handle = handleString.replace(/\.[a-zA-Z]+\b/g, '');

  const locreceive = useMemo(() => {
    if (window && window.localStorage) {
      if (!window.localStorage.getItem('Receive'+wallet.account)) {
        return false;
      }
      try {
        return JSON.parse(window.localStorage.getItem('Receive'+wallet.account));
      } catch (err) {
        console.log(err);
         return false;
      }
    } else {
      return false;
    }
  },[receive,wallet.account]);

  return (
    wallet.status == 'connected' &&
    <div className="LeftList">
      <div className="LeftListHead">
      <Avatar className="LeftList_Avatar" shape="square" size={100}  src={'https://user-content.lenster.xyz/300x300/https://gateway.ipfscdn.io/'+url} />
      <span className="LeftList_Name">{profile.name}</span>
      <span className="LeftList_handle">@{handle}</span>
      <span className="LeftList_bio">{profile.bio}</span>
      <span className="LeftList_profile"><img src={Well}/>{profile.id}</span>
      {/* <span className="LeftList_lenster"><img src={faviconV2}/>https://lenster.xyz/u/marilyn_monroe</span> */}
      <span className="LeftList_address"><img src={riLine}/>{profile && profile.attributes && profile?.attributes[0]?.value||''}</span>
      <span className="LeftList_wallet"><img src={riLinewallet}/>{shortenFileName(wallet.account)}</span>
      {locreceive &&
      <>
        <Progress
          strokeLinecap="butt"
          percent={preSize*100}
          showInfo={false}
          format={() => disSize}
          style={{height:'12px'}}
        />
      <div className="LeftList_Progress">
        <span>{t('Space')}</span>
        <span>{disSize}</span>
      </div>
    </>
    }
    </div>
    <span className="LeftListBox"></span>
    <div className="LeftListBottom">
      <ul>
        <li className="LeftListBottomLensdrive">@2023 Lensdrive</li>
        <li><a onClick={()=>{const w=window.open('about:blank');w.location.href='https://twitter.com/lens_drive';}} >Twitter</a></li>
              <li><a onClick={()=>{const w=window.open('about:blank');w.location.href='https://discord.gg/qS4SZPgG6P';}}>Discord</a></li>
      </ul>
      <ul>
        <li className="LeftListLanguage"><LanguageSwitching/></li>
        <li className="LeftListLanguage"><img src={stTriangle} style={{marginRight:'5px'}}/>Powered by Memolabs</li>
      </ul>
    </div>
    </div>
  );
}

export default LeftList;
