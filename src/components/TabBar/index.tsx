import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import './index.scss';

const TabBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goRecharge = () => {
    navigate('/Pay');
  };
  const goHome = () => {
    navigate('/');
  };
  return (
    <>
      <div className="TabBarPage">
        <div className="container">
          <Button
            ghost
            onClick={goHome}
            className="Files"
          >
            {t('Upload')}
          </Button>
          <Button
            ghost
            onClick={goRecharge}
            className="Top"
          >
            {t('Top-up')}
          </Button>
          {/* <Button
            ghost
            onClick={GoTransfer}
          >
            Transfer
          </Button> */}

        </div>
      </div>
    </>
  );
};

export default TabBar;
