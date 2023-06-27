import { param2Obj, isEmpty } from '@utils/index';

const downloadExcel = (config: any) => {
  window.console.log(config);
  const url = config.url;
  let data: any = {};
  try {
    data = JSON.parse(config.data);
  } catch (e) {
    data = param2Obj(config.data, true);
  }
  const form = document.createElement('form');
  form.action = url;
  form.method = 'post';
  form.style.display = 'none';
  Object.keys(data).forEach((key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = data[key];
    form.appendChild(input);
  });
  const button = document.createElement('input');
  button.type = 'submit';
  form.appendChild(button);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

const downloadCSV = (config: any) => {
  const date = new Date().getTime();
  const blob = new Blob(
    ['\uFEFF' + config.data],
    {
      type: 'application/vnd.ms-excelchartset=utf-8'
    }
  );
  const downloadElement = document.createElement('a');
  const href = window.URL.createObjectURL(blob); // 创建下载的链接
  downloadElement.href = href;
  downloadElement.download = `${date}.csv`;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
  window.URL.revokeObjectURL(href); // 释放掉blob对象
};

/**
 * 下载文件
 * @param {*} action URL地址
 * @param {*} paramObj 额外参数
 */
export function downloadFile(action: any, paramObj = {}) {
  const url = action;
  const data: any = paramObj;
  const form = document.createElement('form');
  form.action = url;
  form.method = 'get';
  form.style.display = 'none';
  if (!isEmpty(data)) {
    Object.keys(data).forEach((key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    });
  }
  const button = document.createElement('input');
  button.type = 'submit';
  form.appendChild(button);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export default {
  downloadExcel,
  downloadCSV
};
