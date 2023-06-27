import React, { useEffect, useState,useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, message, Upload ,Tooltip,Popover ,Image} from 'antd';
import {  DownloadOutlined ,EyeOutlined} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
// import axios from 'axios';
import Header from '@/components/Header';
import LeftList from '@/components/LeftList';
import useMyWallet from '@/hooks/useMyWallet';
// import useWeb3 from '@/hooks/useWeb3';
// import useAppState from '@/hooks/useAppState';
import {useApi,useToken} from '@/hooks/useAppState';
import { formatBytes, utc2beijing } from '@/utils/index';
import { shortenFileName } from '@/utils/index';
import {ObtainImageName} from '@/utils/index';
// import { toSpecialAmount } from '@/utils/amount';
import { useTranslation } from 'react-i18next';
// import providerNode from '@/api/provider';
import './index.scss';
import UploadPage from '../UploadPage';

// eslint-disable-next-line react/no-multi-comp
const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const {memoToken ,profile,receive}= useToken();
  const [loadings, setLoadings] = useState<boolean[]>([]);
  // const [Srcimg, setSrcimg] = useState([]);
  const API = useApi();
  // const tableData: {
  //   current: 1,
  //   pageSize: 10,
  //   total:0
  // }                        <Tooltip

  const columns: Array<any> = [
    {
      title: `${t('Home.Document')}`,
      render: (record) => <div className="ObtainImage">
        <Popover content={decodeURIComponent(record.Name)}  trigger="hover">{shortenFileName(decodeURIComponent(record.Name))}
        </Popover>
        {/* {ObtainImageName(record.Name) != null &&
        <div>
        <EyeOutlined onClick={() => Viewpicture(record)} className="ObtainImageName"/>

        </div>
        } */}
        {ObtainImageName(record.Name) == '' &&
        <div>
        <EyeOutlined onClick={() => Viewpicture(record)} className="ObtainImageName"/>

        </div>
        }
      </div>,
      align: 'center'
    },

    {
      title: `${t('Home.Size_of_File')}`,
      dataIndex: 'Size',
      render: Size => `${formatBytes(Size, 2)}`,
      align: 'center',
      width: 120
    },
    {
      title: `${t('Home.File_Upload')}`,
      dataIndex: 'ModTime',
      render: ModTime => `${utc2beijing(ModTime)}`,
      align: 'center',
      sorter:(a , b) =>{
        const aTime = new Date(a.ModTime).getTime();
        const bTime = new Date(b.ModTime).getTime();
        return aTime - bTime;
      },
      defaultSortOrder: 'descend'
    },
    {
      title: `${t('Home.CID')}`,
      dataIndex: 'Cid',
      render: Cid => `${Cid}`,
      align: 'center',
      textWrap: 'word-break',
      ellipsis: true
    },
    {
      title: `${t('Home.File_Download')}`,
      Name: 'operation',
      fixed: 'right',
      width: 100,
      render: (record,index) =>(

        <Button
          type="dashed"
          icon={<DownloadOutlined />}
          loading={loadings[index.Size]}
          // onClick={() => enterLoading(2)}
          onClick={() => download(record,index.Size)}
        />
      ),
      align: 'center'
    }
  ];
  // const navigate = useNavigate();
  // const web3 = useWeb3();
  const {account, status } = useMyWallet();
  const [isUpload, isSetUpload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [ImgList, setImgList] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [messageApi, contextHold] = message.useMessage();
  useEffect(() => {
    if (memoToken && status === 'connected') {
      getDataList();
      isSetUpload(false);
    } else {
      setDataList([]);
      isSetUpload(true);
    }
  }, [memoToken,status,account]);

  // 获取文件列表
  const getDataList = ()=>{
    API.get('mefs/listobjects')
    .then(function (res){
      if (res && res.status == 200) {
          let arr =res.data.Object;
            arr = arr.sort(function(a,b){
              return ((b.ModTime)>(a.ModTime))?10:-10;
            });
            setDataList(arr);
            // setDataList(res.data.Object);
            // console.log('cid:',arr[0].Cid);
            // console.log('cid:',arr);
        } else {
          setDataList([]);
        }
    });
  };

  const handleUpload = () => {
    let fileexit =null;
    for (let index = 0; index < fileList.length; index++)
    {
      fileexit= dataList.find(item => item.Name == fileList[index].name);
      console.log('fileexit',fileexit,'filename:',JSON.stringify(fileList[index]));
      if (fileexit) {
        message.error(`${t('Home.file_exits')}`);
        break;
      }
    }
    if (!fileexit) {
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
          console.log(res);
          if(res.status == 200){
            setUploading(false);
            setFileList([]);
            getDataList();
            messageApi.open({
              type: 'success',
              content: `${t('Home.upload_successfully')}`,
              duration: 5
            });
            setIsModalOpen(false);
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
          setUploading(false);
        });
      };
    });
    setUploading(true);
  }
  };
  
  // 下载方法
  const download = (items,index)=>{
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_URL}/mefs/${items.Cid}`;
      link.click();
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 6000);
  };
  const Viewpicture = (items) =>{
    setImgList(items.Cid);
    setVisible(true);
  };
  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-2);
    setFileList(newFileList);
    setFileSize(newFileList[0] ? newFileList[0].size : 0);
  };

  const props: UploadProps = {
    onChange: handleChange,
    onRemove: file => {
      setUploading(false);
      setFileSize(0);
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068'
      },
      strokeWidth: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setUploading(false);
    setFileList([]);
    setFileSize(0);

  };

  // 取消弹窗
  const handleCancel = () => {
    setIsModalOpen(false);
    setUploading(false);
    setFileList([]);
    setFileSize(0);
  };
  const locreceive = useMemo(() => {
    if (window && window.localStorage) {
      if (!window.localStorage.getItem('Receive'+account)) {
        return false;
      }
      try {
        return JSON.parse(window.localStorage.getItem('Receive'+account));
      } catch (err) {
        console.log(err);
         return false;
      }
    } else {
      return false;
    }
    //&& dataList != undefined && dataList.length != 0
    // dataList == undefined || dataList.length == 0
  },[receive,account]);
  return (
    <>
    {contextHold}
        <div className="HomePage">
        <Header />
        {profile?.handle && status == 'connected' && locreceive  &&
  <>
        <div className="container">
        <LeftList/>
          <div className="Home">
            <div className="Home_button">
              <Button
                style={{minWidth:'120px'}}
                type="primary"
                shape="round"
                size="large"
                disabled={isUpload && !locreceive}
                onClick={showModal}
              >
                {t('Upload')}
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={dataList}
              locale={{ emptyText: `${t('Home.No_Data')}` }}
              rowKey={(record) => shortenFileName(record.Cid+Math.random())}
              pagination={{pageSize:10,showSizeChanger:false}}
            />
              <Image
                style={{ display: 'none' }}
                className="ImageShow"
                src={'https://lensmiddlewareapi.metamemo.one:8080/mefs/'+ImgList}
                preview={{
                  visible,
                  onVisibleChange: (value) => {
                    setVisible(value);

                  },
                  src: 'https://lensmiddlewareapi.metamemo.one:8080/mefs/'+ImgList
                }}
              />
          </div>
        </div>

        <Modal title={<div className="iconPa">{t('Home.Upload_Files')}</div>}
          open={isModalOpen}
          onOk={handleOk}
          closable={false}
          className="antModalFooter"
          footer={[
            <Button key="back"
              onClick={handleCancel}
              disabled={uploading == true}
            >
            {t('Home.Close')}
          </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              className="handleUpd"
              loading={uploading}
              style={{ marginTop: 16
                , background: '#389220'
                , border: '0px'
              }}
            >
              {uploading ? 'Uploading' : `${t('Home.Start_upload')}`}
            </Button>
          ]}
        >
          <Upload {...props}
            maxCount={1}
            fileList={fileList}
          >
            <p>{t('Home.Select_the_File')}
            <Button
              disabled={uploading == true}
              icon={<UploadOutlined />}
            >{t('Home.Select_File')}</Button>
            </p>
          </Upload>
          <div className="item-fileInfo"
            style={{display: (fileList.length !== 0 ? 'block' : 'none')}}
          >
            <p>{t('Home.Size_of_Upload_File')}：{formatBytes(fileSize, 2)}</p>
          </div>
         
        </Modal>
        <div className="Mobile_terminal">
          {dataList != undefined && dataList.length != 0 ?
            <ul className="container">
              {dataList.map((item: any) => {
                return (
                  <li className="Mobile"
                    key={(item.Cid +Math.random()) ? (item.Cid+Math.random()).replace(/"/g, '') : ''}
                  >
                    <div className="Mobile_file">
                      <p >{t('Home.Document')}</p>
                      <p>
                        <Tooltip
                          placement="topLeft"
                          title={decodeURIComponent(item.Name)}
                        >
                          {shortenFileName(decodeURIComponent(item.Name))}
                        </Tooltip>
                      </p>
                    </div>
                    <div className="Mobile_file">
                      <p>{t('Home.Size_of_File')}</p>
                      <p>{formatBytes(item.Size, 2)}</p>
                    </div>
                    <div className="Mobile_file">
                      <p>{t('Home.File_Upload')}</p>
                      <p>{utc2beijing(item.ModTime)}</p>
                    </div>
                    <div className="Mobile_file">
                      <p>MID</p>
                      <p><Tooltip
                        placement="topLeft"
                        title={(item.Cid)}
                      >{shortenFileName((item.Cid) ? (item.Cid).replace(/"/g, '') : '')}
                      </Tooltip>
                      </p>
                    </div>
                    <div className="Mobile_file">
                      <div>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => download(item,0)}
                      >
                        {t('Home.Download')}
                      </Button>
                      </div>
                    </div>
                  </li>
                );
              },

              )}
            </ul>
            :
            <div className="Mobile_termina">
              {isUpload ?
                <div className="container" >
                  <span className="iconfont icon-weikong"/>
                  <p>{t('Home.No_data')}</p>
                </div>
                :
                <div className="container" >
                    <div className="container" >
                      <span className="iconfont icon-weikong"/>
                      <p>{t('Home.No_data')}</p>
                    </div>
                </div>
              }
            </div>
          }
          <div>
          </div>
        </div>
        </>
  }
  {(!profile?.handle || (!locreceive) || status != 'connected') &&
    <UploadPage/>
  }
    </div>
    </>
  );
};

export default HomePage;
