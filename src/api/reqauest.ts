/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import qs from 'qs';
import {isEmpty, setQueryConfig} from '@utils/index';
import { AnyFunction } from '@/utils/types';
import downloadHelper from '@/utils/download-helper';

class BaseRequest {
  public prefixURL = '';
  // axios 实例
  private instance!: AxiosInstance;

  public onUploadProgress?: (ProgressEvent: any) =>void;

  public constructor() {
    this._init();
  }

  private _init() {
    this.instance = axios.create();

    // 允许存储 cookies
    this.instance.defaults.withCredentials = true;

    this.instance.defaults.baseURL = process.env.REACT_APP_URL;

    // 请求超时时长， 0 不限制
    this.instance.defaults.timeout = 0;

    this._setHeader('Connect-Type', 'application/x-www-from-urlencoded;charset=utf-8', 'post');

    this._setHeaderFiled('token', '');

    this._injectRequestHook((config: AxiosRequestConfig) => {
      return config;
    });

    this._injectResponseHook((response: AxiosResponse) => {
      return response;
    }, (error: any) => {
      console.log('err', error);
      console.log('请求出错, 稍后重试');
      return Promise.reject(error);
    });
  }

  /**
   * 附加设置request headers
   * @param {String} key header的key
   * @param {String} value header的value
   * @param {String} requestType 请求类型
   * @example axios.defaults.headers['token'] = ''
   */
  private _setHeader(key: string, value: string, requestType: string) {
    if (key && value) {
      this.instance.defaults.headers[requestType || 'common'][key] = value;
    }
  }

  /**
   * 自定义axios原型链上的方法属性
   * @param key ajax 原生支持的方法属性
   * @param value 传递的属性值
   */
  public _setPrototype(key: defaultsPrototype, value: any) {
    this.instance.defaults[key] = value;
    console.log('onUploadProgress', this.instance.defaults);
  }

  /**
   * 添加请求头token
   * @param {*} value token
   */
  public _setHeaderFiled(filed: string, value: string) {
    if (!isEmpty(value)) {
      this.instance.defaults.headers[filed] = value;
    }
  }

  /**
   * 注入请求钩子函数
   * @param {*} hookFunction 回调
   */
  private _injectRequestHook(hookFunction: AnyFunction<any>) {
    this.instance.interceptors.request.use((config: AxiosRequestConfig) => {
      if (typeof hookFunction === 'function') {
        return hookFunction(config);
      }
    });
  }

  /**
   * 注入请求响应钩子函数
   * @param {*} resolveHook resolveHook 成功钩子函数
   * @param {*} rejectHook rejectHook 失败钩子函数
   */
   private _injectResponseHook(resolveHook: AnyFunction<any>, rejectHook: AnyFunction<any>) {
    this.instance.interceptors.response.use((response: AxiosResponse) => {
      if (typeof resolveHook === 'function') {
        if (response.headers && response.headers['content-type'] === 'application/x-msdownload;charset=utf-8') {
          const config = response.config;
          if (config.method === 'get') {
            downloadHelper.downloadCSV(response);
          }
          return;
        }

        const returnValue = resolveHook(response);
        if (typeof returnValue !== 'undefined') {
          if (returnValue && returnValue.data.code) {
            switch (returnValue.data.code) {
              case -1: // 链接无token
                console.log('链接无token');
                break;
            }
          }
          return returnValue;
        }
      }
    }, (error: any) => {
      if (typeof rejectHook === 'function') {
        const returnValue = rejectHook(error);
        if (typeof returnValue !== 'undefined') {
          return Promise.reject(returnValue);
        }
      }
      return error;
    });
  }

  public fetchDelOrGet(
    url: string,
    params: object = {},
    method: Method = 'get',
    ...options: any[]
  // eslint-disable-next-line no-undef
  ): Promise<TheResponse> {
    if (!options[0]) {
      return new Promise((resolve, reject) => {
        this.instance({ url, method, params}).then((res) =>{
          resolve(res.data);
        }).catch((error: any) => {
          reject(error);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.instance({ url, method, ...options[1]}).then((res): string => {
          return 'data:image/png;base64,' + btoa(
            new Uint8Array(res.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
        }).then((data: string) => {
          resolve({ status: 'success', data, code: 0, message: '图片转换成功'});
        }).catch((error: any) => {
          reject(error);
        });
      });
    }
  }

  /**
   * 自定义请求类型
   * @param {*} type 请求类型
   * @param {*} url 请求URL
   * @param {*} options 0：接口所需参数
   * @param {*} options 1：发送的数据的格式类型：String-->json字符串形式，Object-->对象形式
   * @param {*} options 2：是否需要在URL后面拼接参数，默认不需要(不传)
   * @example eg: {page: 1, pageSize: 10} --> url?page=1&pageSize=10
   * @returns {Promise<TheResponse>} 返回Ajax请求Promise对象
   */
  public fetch(method: Method, url: string, ...options: any[]): Promise<TheResponse> {
    url = !isEmpty(options[2]) ? url + setQueryConfig(options[2]) : url;
    const params = options[1] === 'String' ? qs.stringify(options[0]) : options[0];
    return new Promise((resolve, reject) => {
      this.instance({ url, method, data: params}).then((res) => {
        resolve(res.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  /**
   * 导出请求
   * @param {*} url 请求URL
   * @param {*} params 请求参数
   * @param {*} querys 是否需要在URL后面拼接参数
   */
  public exportToExcel(url: string, params: object = {}, querys: object = {}) {
    if (!isEmpty(querys)) {
      url = url + setQueryConfig(querys);
    }
    return new Promise((resolve, reject) => {
      this.instance.get(url, {
        params,
        headers: {
          responseType: 'arraybuffer'
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}

export default BaseRequest;