import React, { createContext, useCallback, useState } from 'react';
import { getLocale, setLocale as setLocaleString } from '@/constants/locales';
export const Context = createContext({locale: null, setLocale:null, storageBalance:null, setStorageBalance:null,lensToken: '' ,setLensToken: null,memoToken: '',setMemoToken: null,storage: {Used:'', Free:'', Available:'', Files:''}, setStorage:null,profile: {name:'',handle:'',id:'',picture:{original:{url:''}},bio:'',attributes:[{value:''}]}, setProfile:null,profiles: [{name:'',handle:'',id:'',picture:{original:{url:''}}, bio:'',attributes:[{value:''}]}], setProfiles:null,setDisSize:null,setPreSize:null,disSize:'',preSize:0,receive:false, setReceive:null,lensclient:null, setLensclient:null});

interface IProps {
  children: any
}

const AppStateContext: React.FC<IProps> = ({children}) => {
  const [locale, setLocale] = useState(getLocale());

  const handleActiveLocale = useCallback((val) => {
    setLocaleString(val);
    setLocale(val);
  }, [setLocale]);
  const [storageBalance, setStorageBalance] = useState(0);
  const [lensToken, setLensToken] = useState('');
  const [memoToken, setMemoToken] = useState('');
  const [profile, setProfile] = useState({name:'',handle:'',id:'',picture:{original:{url:''}},bio:'',attributes:[{value:''}]});
  const [profiles, setProfiles] = useState([{name:'',handle:'',id:'',picture:{original:{url:''}},bio:'',attributes:[{value:''}]}]);
  const [storage, setStorage] = useState({Used:'', Free:'', Available:'', Files:''});
  const [disSize, setDisSize] = useState('');
  const [receive, setReceive] = useState(false);
  const [lensclient, setLensclient] = useState(null);
  
  //空间内容多少
  const [preSize, setPreSize] = useState(0);
  return (
    <Context.Provider value={{ locale, setLocale: handleActiveLocale, storageBalance, setStorageBalance, lensToken, setLensToken, memoToken, setMemoToken,storage, setStorage, profile, setProfile, disSize, setDisSize,preSize,setPreSize,receive, setReceive,profiles, setProfiles,lensclient, setLensclient}}>
      {children}
    </Context.Provider>
  );
};

export default AppStateContext;