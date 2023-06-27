import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button, message, Upload ,notification ,Alert} from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
// import axios from 'axios';
// import Header from '@/components/Header';
import useMyWallet from '@/hooks/useMyWallet';
import LanguageSwitching from '@/components/Header/components/LanguageSwitching';
// import useWeb3 from '@/hooks/useWeb3';
// import useAppState from '@/hooks/useAppState';
import {useApi,useToken} from '@/hooks/useAppState';
// import { formatBytes } from '@/utils/index';
// import { toSpecialAmount } from '@/utils/amount';
import { useTranslation } from 'react-i18next';
// import providerNode from '@/api/provider';
import upload from '@/assets/images/stLine.png';
import stLineNetworkx from '@/assets/images/stLine_networkx.png';
import stTriangle from '@/assets/images/st_triangle.png';
type NotificationType =  'error';
import './index.scss';

// eslint-disable-next-line react/no-multi-comp
const Uploader: React.FC = () => {
  const { t } = useTranslation();
  const {memoToken}= useToken();
  const API = useApi();
  // const tableData: {
  //   current: 1,
  //   pageSize: 10,
  //   total:0
  // }

  // const navigate = useNavigate();
  // const web3 = useWeb3();
  const {account, status} = useMyWallet();
  const [isUpload, isSetUpload] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dataList, setDataList] = useState([]);
  //提示没注册Lensdrive。
  const [api, contextHolder] = notification.useNotification();
  const [messageApi, contextHold] = message.useMessage();
  // const [fileSize, setFileSize] = useState(0);
  useEffect(() => {
    if (memoToken && status === 'connected') {
      getDataList();
      isSetUpload(false);
      console.log(dataList);
    } else {
      setDataList([]);
      isSetUpload(true);
    }
  }, [memoToken,status,account]);



  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: `${t('uploadPage.Defeated')}`,
      description:
        <div>
          <p>{t('uploadPage.Lens')}<a href="https://claim.lens.xyz/">claiming site</a>{t('uploadPage.claim')}</p>
        </div>
    });
  };

  // 获取文件列表
  const getDataList = ()=>{
    API.get('mefs/listobjects')
    .then(function (res){
      if (res && res.status == 200) {
            setDataList(res.data.Object);
        } else {
          setDataList([]);
        }
    });
  };

  const handleUpload = async() => {
    const reader = new FileReader();
    fileList.forEach(file => {
      reader.readAsArrayBuffer(file.originFileObj);
      reader.onload = async() => {
        let formData = new FormData();
        formData.append('file', file.originFileObj);
        await API({
          method: 'POST',
          url:'/mefs/',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data:formData
        }).then(function (res) {
          if(res.status == 200){
            openNotificationWithIcon('error');
            setUploading(false);
            setFileList([]);
            getDataList();
            messageApi.open({
              type: 'success',
              content: `${t('Home.upload_successfully')}`,
              duration: 5
            });
          }else{
            messageApi.open({
              type: 'error',
              content: `${t('Home.upload_failed')}`,
              duration: 5
            });
            setUploading(false);
          }
        })
        .catch(function (error) {
          console.log(JSON.stringify(error));
          messageApi.open({
            type: 'error',
            content: `${t('Home.file_err')}`,
            duration: 5
          });
          // message.error(`upload failed.${error}`);
          setUploading(false);
        });
      };
    });
    setUploading(true);
  };




  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-2);
    setFileList(newFileList);
    // handleUpload();
  };

  const props: UploadProps = {
    onChange: handleChange,
    onRemove: file => {
      setUploading(false);

      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    }
  };



  return (
    <>
      <div className="UploadPage">
        <div className="Home_background">
          <div className="container">
            <h1>{t('uploadPage.Lensdrive')}</h1>
            <p>{t('uploadPage.Lenster')}</p>
          </div>
        </div>
        {contextHolder}
        {contextHold}
        <div className="container">
          <div className="Home">
          <h1>{t('uploadPage.Private')}</h1>
            <Upload {...props}
              maxCount={1}
              disabled={isUpload}
              listType="picture"
              style={{width:'100%'}}
            >
              <Button
                disabled={uploading == true}
                className="UploadPa"
              >
                <img src={upload}/>
                {t('Home.Select_the_Fi')}
              </Button>
            </Upload>

            {status != 'connected' && <Alert  className="Alert"  message={t('uploadPage.Please')} type="error" showIcon closable />}
            <Button
              type="primary"
              size="large"
              className="LeftListButton"
              onClick={handleUpload}
              disabled={fileList?.length === 0}
              loading={uploading}
              style={{ marginTop: 16, background: '#208311', border: '0px' }}
            >
              {uploading ? 'Uploading' : `${t('Home.Start_upload')}`}
            </Button>
          </div>
          <div className="LeftList">
          <div className="LeftListBottom">
            <ul>
              <li className="LeftListBottomLensdrive">@2023 lensdrive</li>
              <li><a onClick={()=>{const w=window.open('about:blank');w.location.href='https://twitter.com/lens_drive';}} >Twitter</a></li>
              <li><a onClick={()=>{const w=window.open('about:blank');w.location.href='https://discord.gg/qS4SZPgG6P';}}>Discord</a></li>
            </ul>
            <ul>
              <li className="LeftListLanguage"><img src={stLineNetworkx} /><LanguageSwitching /></li>
              <li className="LeftListLanguage"><img src={stTriangle} style={{ marginRight: '5px' }} />Powered by Memolabs</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Uploader;
