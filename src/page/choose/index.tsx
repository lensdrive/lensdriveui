import React from 'react';
import memo from '@/assets/images/MEMO.png';
import Aptos from '@/assets/images/APTOS.png';
import { useTranslation } from 'react-i18next';
import './index.scss';

function Choose() {
  const { t } = useTranslation();

  const urlMemo = () =>{
    window.open(`${process.env.REACT_APP_MIDDLEWARE_URLI}`, '_self');
  };
  const urlAptos = () => {
    window.open(`${process.env.REACT_APP_MIDDLEWARE_URL}`, '_self');
  };
  return (
    <div className="Choose">
      <div className="chain">
        <div className="container">
          <h1>Choose a chain</h1>
          <h3>{t('including')}</h3>
          <div className="Choose_chain">
            <ul>
              <li onClick={()=>urlMemo()}>
                <div className="Choose_img">
                  <img src={memo} />
                </div>

                <div>
                  <h3>MEMO</h3>
                  <p>Memo Smart Chain Mainnet</p>
                </div>
              </li>
              <li onClick={()=>urlAptos()}>
                <div className="Choose_img">
                  <img src={Aptos} />
                </div>
                <div>
                  <h3>APTOS</h3>
                  <p>Aptos MainNet</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Choose;
