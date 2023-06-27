import { useContext,useMemo } from 'react';
import { Context } from '@/contexts/AppState';
import axios from 'axios';


const useAppState = () => {
  const { storageBalance, setStorageBalance } = useContext(Context);
  return { storageBalance, setStorageBalance};
};

export const useToken = () => {
  const { lensToken, setLensToken, memoToken, setMemoToken, profile, setProfile, profiles, setProfiles ,disSize, setDisSize,preSize,setPreSize,receive, setReceive,lensclient, setLensclient} = useContext(Context);
  return { lensToken, setLensToken, memoToken, setMemoToken, profile, setProfile, profiles, setProfiles,disSize, setDisSize,preSize,setPreSize,receive, setReceive,lensclient, setLensclient};
};

export const useStorage = () => {
  const { storage, setStorage } = useContext(Context);
  return { storage, setStorage };
};

export const useApi = () => {
  const { lensToken, memoToken } = useToken();
  return useMemo(() => {
      return axios.create({
          baseURL: `${process.env.REACT_APP_URL}`,
          timeout: 7000000,
          headers: { 'Content-Type': 'application/json',
          Authorization: 'Bearer '+memoToken
          // LensToken: 'Bearer '+lensToken,
         }
      });
  }, [lensToken, memoToken]);
};

export const uselensApi = (url) => {
  const { lensToken, memoToken } = useToken();
  return useMemo(() => {
      return axios.create({
          baseURL: url || 'https://api.lens.dev/',
          timeout: 7000000,
          headers: { 'Content-Type': 'application/json',
          Authorization: 'Bearer '+lensToken
          // LensToken: 'Bearer '+lensToken,
         }
      });
  }, [lensToken, memoToken]);
};


export default useAppState;