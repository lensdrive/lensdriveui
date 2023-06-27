// axios
// eslint-disable-next-line no-unused-vars
interface TheResponse<T = any> {
  data: T;
  code: number;
  status: 'success' | 'fail';
  message: string;
}