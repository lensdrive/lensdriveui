import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import {Dropdown} from 'antd';
import stLineNetworkx from '@/assets/images/stLine_networkx.png';
import './index.scss';


function LanguageSwitching() {
  const {i18n} = useTranslation();
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a target="_blank" onClick={() => i18n.changeLanguage('zh-CN')}>
          Chinese
        </a>
      )
    },
    {
      key: '2',
      label: (
        <a target="_blank" onClick={() => i18n.changeLanguage('en')}>
          English
        </a>
      )
    }
  ];
  return (
    <div className="Languag"
      // onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh-CN' : 'en')}
    >
      <Dropdown menu={{ items }} className="Dropdown" placement="bottomLeft" >
      {i18n.language === 'en' ?
        // <span className="iconfont icon-zhongyingwenqiehuan-yingwen"/>
      <div className="Languag_i18n"><img src={stLineNetworkx}/><div>English</div></div>
      :
      // <span className="iconfont icon-zhongyingwenqiehuan-zhongwen"/>
      <div className="Languag_i18n"><img src={stLineNetworkx}/><div>Chinese</div></div>
    }
    </Dropdown>
    </div>
  );
}

export default LanguageSwitching;
