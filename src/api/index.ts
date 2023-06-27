/* eslint-disable no-undef */
import BaseRequest from './reqauest';

class ApiIndex extends BaseRequest {

  /**
   * 发送 Get 或者 Delete 请求
   * @param url url 地址
   * @param params 参数
   * @param type 请求类型，默认 `Get`
   */
  public ajaxGetOrDel(url: string, params = {}, type: Method = 'get') {
    console.log(url, params, type);
    return super.fetchDelOrGet(url, params, type);
  }

  public ajax(type: Method, url: string, ...options: any[]) {
    console.log(type, url, ...options);
    return super.fetch(type, url, ...options);
  }
}

export default new ApiIndex();