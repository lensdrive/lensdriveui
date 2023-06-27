import BaseRequest from './reqauest';

class ProviderNode extends BaseRequest{
  public putObject(params: any){
    return super.fetch('put', '', params);
   }
}
export default new ProviderNode();