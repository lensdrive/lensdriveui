import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, message, Upload ,Tooltip} from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import convert from 'xml-js';
import axios from 'axios';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import useMyWallet from '@/hooks/useMyWallet';
import useWeb3 from '@/hooks/useWeb3';
import useAppState from '@/hooks/useAppState';
import { formatBytes, utc2beijing } from '@/utils/index';
import { shortenFileName } from '@/utils/index';
import { toSpecialAmount } from '@/utils/amount';
import { useTranslation } from 'react-i18next';
// import providerNode from '@/api/provider';
import './index.scss';

// eslint-disable-next-line react/no-multi-comp
const HomePage: React.FC = () => {
  const { t } = useTranslation();
  
  // const tableData: {
  //   current: 1,
  //   pageSize: 10,
  //   total:0
  // }
  const columns: Array<any> = [
    {
      title: `${t('Home.Document')}`,
      dataIndex: 'Key',
      render: Key => `${decodeURIComponent(Key._text)}`,
      align: 'center'
    },

    {
      title: `${t('Home.Size_of_File')}`,
      dataIndex: 'Size',
      render: Size => `${formatBytes(Size._text, 2)}`,
      align: 'center'
    },
    {
      title: `${t('Home.File_Upload')}`,
      dataIndex: 'LastModified',
      render: LastModified => `${utc2beijing(LastModified._text)}`,
      align: 'center',
      sorter:(a , b) =>{
        const aTime = new Date(a.LastModified._text).getTime();
        const bTime = new Date(b.LastModified._text).getTime();
        return aTime - bTime;
      },
      defaultSortOrder: 'descend'
    },
    {
      title: `${t('Home.CID')}`,
      dataIndex: 'ETag',
      render: ETag => `${(ETag._text) ? (ETag._text).replace(/"/g, '') : ''}`,
      align: 'center'
    },
    {
      title: `${t('Home.File_Download')}`,
      key: 'operation',
      fixed: 'right',
      width: 200,
      render: (record) =>(
        <Button type="primary"
          shape="default"
          icon={<DownloadOutlined />}
          onClick={() => download(record.Key._text)}
        >
          {t('Home.Download')}
        </Button>
      ),
      align: 'center'
    }
  ];
  const navigate = useNavigate();
  const web3 = useWeb3();
  const {account, status} = useMyWallet();
  const {storageBalance, setStorageBalance} = useAppState();
  const [isUpload, isSetUpload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [filePrice, setFilePrice] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [isNoPrice, setIsNoPrice] = useState(false);
  useEffect(() => {
    if (status === 'connected') {
      getBalance();
      getDataList();
      isSetUpload(false);
      if(storageBalance != 0) {
        setIsNoPrice(false);
      } else {
        setIsNoPrice(true);
      }
    } else {
      setDataList([]);
      isSetUpload(true);
      setIsNoPrice(true);
    }
  }, [account, status, storageBalance]);

  // 获取文件列表
  const getDataList = ()=>{
    axios.get(`${process.env.REACT_APP_URL}/${account}?list-type=2&encoding-type=url&delimiter=/&fetch-owner=true`)
    .then(function (res){
      if (res && res.status == 200) {
        const result = convert.xml2json(res.data,{compact: true, spaces: 2});
        let dataList= JSON.parse(result);
        if (dataList.ListBucketResult.Contents) {
          if ((dataList.ListBucketResult.Contents).constructor === Array) {
            let arr =dataList.ListBucketResult.Contents;
            arr = arr.sort(function(a,b){
              return ((b.LastModified._text)>(a.LastModified._text))?10:-10;
            });
            setDataList(arr);
          } else {
            setDataList(() => {
              return [dataList.ListBucketResult.Contents];
            });
          }
        } else {
          setDataList([]);
        }
      }
    });
  };

  // 查询余额
  const getBalance = () =>{
    axios.get(`${process.env.REACT_APP_URL}/?getbalance=""&addr=${account}`)
    .then(function (res){
      let result2 = convert.xml2json(res.data, {compact: false, spaces: 2});
      let bbos= JSON.parse(result2);
      let boos = bbos.elements[0].elements[1].elements[0].text;
      setStorageBalance(boos);
    });
  };

  const goPay = () => {
    navigate('/Pay');
  };

  const handleUpload = async() => {
    const reader = new FileReader();
    fileList.forEach(file => {
      reader.readAsArrayBuffer(file.originFileObj);
      reader.onload = async(e) => {
        await fetch(`${process.env.REACT_APP_URL}/${account}?getbalance=""`, {
          method: 'GET'
        });
        await axios({
          method: 'put',
          url:`${process.env.REACT_APP_URL}/${account}/${fileList[0].name}`,
          headers: {
            'X-Amz-Meta-Sign': await signature(),
            'X-Memo-Expires-Day': '365',
            'X-Memo-Price': filePrice.toString(),
            'Content-Type': 'application/octet-stream'
          },
          data: e.target.result
        }).then(function (res) {
          if(res.status == 200){
            setUploading(false);
            setFileList([]);
            setFilePrice(0);
            getDataList();
            message.success(`${t('Home.upload_successfully')}`);
            setIsModalOpen(false);
          }else{
            message.error(`${t('Home.upload_failed')}`);
            setUploading(false);
          }
        })
        .catch(function (error) {
          const errData = convert.xml2json(error.response.data,{compact: true, spaces: 2});
          const errMessage= JSON.parse(errData);
          message.error(`${errMessage.Error.Message._text},upload failed.`);
          setUploading(false);
        });
      };
    });
    setUploading(true);
  };

  // 下载方法
  const download = (items)=>{
    const fileName = decodeURIComponent(items);
    fetch(`${process.env.REACT_APP_URL}/${account}/${fileName}`,{
      method:'GET'
    }).then(function(res){
      const link = document.createElement('a');
      link.href = res.url;
      link.click();
    });
  };


  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-2);
    setFileList(newFileList);
    setFileSize(newFileList[0] ? newFileList[0].size : 0);
    getPrice(newFileList[0] ? newFileList[0].size : 0);
  };

  const getPrice = (size) =>{
    if (size) {
      axios.get(`${process.env.REACT_APP_URL}/?queryprice=""&bucket=${account}&ssize=${size}&stime=365`)
      .then(function (res){
        let resData = convert.xml2json(res.data, {compact: false, spaces: 2});
        let bbos= JSON.parse(resData);
        let boos = bbos.elements[0].elements[1].elements[0].text;
        setFilePrice(boos);
        if( 1*storageBalance < 1*boos ){
          setIsNoPrice(true);
        } else {
          setIsNoPrice(false);
        }
      });
    }
  };

  const props: UploadProps = {
    onChange: handleChange,
    onRemove: file => {
      setUploading(false);
      setFileSize(0);
      setFilePrice(0);
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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setUploading(false);
    setFileList([]);
    setFileSize(0);
    setFilePrice(0);
  };

  // 取消弹窗
  const handleCancel = () => {
    setIsModalOpen(false);
    setUploading(false);
    setFileList([]);
    setFileSize(0);
    setFilePrice(0);
  };

  const signature = async () => {
    try {
      let tmp = 365;
      const hash = web3.utils.keccak256(tmp.toString());
      const sign = await web3.eth.sign(hash, account);
      // const sign = (await web3.eth.sign(hash, account)).replace(/^0\x/, '');
      return sign;
    } catch {
      setUploading(false);
      return false;
    }
  };
  const goRecharge = () =>{
    navigate('/Pay');
  };
  return (
    <>
      <div className="HomePage">
        <Header />
        <div className="container">
          <div className="Home">
            <div className="Home_button">
              <Button
                type="primary"
                shape="default"
                icon={<UploadOutlined />}
                size="large"
                disabled={isUpload}
                onClick={showModal}
              >
                {t('Upload')}
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={dataList}
              locale={{ emptyText: `${t('Home.No_Data')}` }}
              rowKey={(record) => record.ETag._text ? record.ETag._text.replace(/"/g, '') : ''}

            />
          </div>
        </div>

        <Modal title={t('Home.Upload_Files')}
          open={isModalOpen}
          onOk={handleOk}
          footer={[
            <Button key="back"
              onClick={handleCancel}
              disabled={uploading == true}
            >
            {t('Home.Close')}
          </Button>
          ]}
        >
          <Upload {...props}
            maxCount={1}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}
              disabled={uploading == true}
            >{t('Home.Select_the_File')}</Button>
          </Upload>
          <div className="item-fileInfo"
            style={{display: (fileList.length !== 0 ? 'block' : 'none')}}
          >
            <p>{t('Home.Size_of_upload')}{formatBytes(fileSize, 2)}</p>
            <p>{t('Home.Estimated_cost_of_uploading')}{toSpecialAmount(filePrice, 18, 8)}Memo</p>
          </div>
          {
            isNoPrice ?
            <>
              <p className="reacher-hint">*{t('Home.Insufficient_balance')}</p>
              <Button
                type="primary"
                size="large"
                onClick={goPay}
                style={{ width: 98.70, marginRight: 10 }}
              >
                {t('Top-up')}
              </Button>
            </> : ''
          }
          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            disabled={fileList.length === 0 || isNoPrice}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? 'Uploading' : `${t('Home.Start_upload')}`}
          </Button>
        </Modal>
        <div className="Mobile_terminal">
          {dataList != undefined && dataList.length != 0 ?
            <ul className="container">
              {dataList.map((item: any) => {
                return (
                  <li className="Mobile"
                    key={(item.ETag._text) ? (item.ETag._text).replace(/"/g, '') : ''}
                  >
                    <div className="Mobile_file">
                      <p >{t('Home.Document')}</p>
                      <p>
                        <Tooltip
                          placement="topLeft"
                          title={decodeURIComponent(item.Key._text)}
                        >
                          {shortenFileName(decodeURIComponent(item.Key._text))}
                        </Tooltip>
                      </p>
                    </div>
                    <div className="Mobile_file">
                      <p>{t('Home.Size_of_File')}</p>
                      <p>{formatBytes(item.Size._text, 2)}</p>
                    </div>
                    <div className="Mobile_file">
                      <p>{t('Home.File_Upload')}</p>
                      <p>{utc2beijing(item.LastModified._text)}</p>
                    </div>
                    <div className="Mobile_file">
                      <p>Cid</p>
                      <p>{shortenFileName((item.ETag._text) ? (item.ETag._text).replace(/"/g, '') : '')}</p>
                    </div>
                    <div className="Mobile_file">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => download(item.Key._text)}
                      >
                        {t('Home.Download')}
                      </Button>
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
                  {storageBalance == 0 ?
                    <div className="container" >
                      <span className="iconfont icon-shoujichongzhi"/>
                      <p>{t('Home.Please_top-up')}</p>
                      <span onClick={goRecharge}>({t('Home.Click_to_redirect')})</span>
                    </div> :
                    <div className="container" >
                      <span className="iconfont icon-weikong"/>
                      <p>{t('Home.No_data')}</p>
                    </div>
                  }
                </div>
              }
            </div>
          }
          <div>
          </div>
        </div>
        <TabBar/>
      </div>
    </>
  );
};

export default HomePage;
