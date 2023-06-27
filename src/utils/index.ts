/**
 * 目标变量是否为空
 * @param val 目标值
 */
export function isEmpty(val: any): boolean {
  if (typeof val === 'boolean') {
		return true;
	}
	if (Object.prototype.toString.call(val) === '[object Array]') {
		if (val.length === 0) {
			return true;
		}
	} else if (val instanceof Object) {
		if (JSON.stringify(val) === '{}') {
			return true;
		}
	} else {
		if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '') {
			return true;
		}
		return false;
	}
	return false;
}

/**
 * 设置query参数
 * @param querys object 的键值对
 * @example var queryConfig = {'page': 'index', 'method': 2, 'subpage': -1, 'spec_method': -1}
 */
 export function setQueryConfig(querys: any): string {
	let str = '';
	for (const o in querys) {
		if (querys[o] !== -1) {
			str += o + '=' + querys[o] + '&';
		}
	}
	str = str.substring(0, str.length - 1);
	return '?' + str;
}

/**
 * 获取url参数
 * @param param 某个参数名
 */
 export function getQueryString(param: string): string | null | undefined {
	const reg = new RegExp('(^|&)' + param + '=([^&]*)(&|$)', 'i');

	let r: any = '';
	try {
		r = window.location.hash.split('?')[1].match(reg);
 	} catch (error) {
		r = null;
	}
	if (r != null) {
		return decodeURIComponent(r[2]);
	}
	return null;
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
 export function getParams2Object(url: string): any {
	const keyValueArr = url.split('?')[1].split('&');
	const paramObj: any = {};
	keyValueArr.forEach((item) => {
		const keyValue = item.split('=');
		paramObj[keyValue[0]] = keyValue[1];
	});
}

/**
 * 将URL参数转成object
 */
 export function param2Obj(url:string, isExport = false): object {
	if (!isExport) {
		const search = url.split('?')[1];
		if (!search) {
			return {};
		}
		return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g,'\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
	} else {
		return JSON.parse('{"' + decodeURIComponent(url).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
	}
}

export function shortenAddress(address: any, lChars=6, rChars = 4) {
	if(address) {
		return `${address.substring(0, lChars )}...${address.substring(
			42 - rChars
		)}`;
	}else {
		return '';
	}
}

export function shortenFileName(address: any, lChars=7, rChars = 9) {
	if(address && address.length > 15) {
		return `${address.substring(0, lChars )}...${address.substring(
			address.length - rChars
		)}`;
	}else {
		return address || '';
	}
}
export function ObtainImageName(SuffixName) {
	const regex = /\.(jpg|jpeg|png|gif|svg)$/i;
	const match = SuffixName.match(regex);
	if (match) {
    return match[1];
  } else {
    return null;
  }
}
// 数据容量单位转换(kb, mb, gb, tb)
export function formatBytes(a, b) {
	if (0 == a) return '0 B';
	const c = 1024;
	const d = b || 2;
	const e = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const f = Math.floor(Math.log(a) / Math.log(c));
	return parseFloat((a/Math.pow(c, f)).toFixed(d)) + '' +e[f];
}

export function utc2beijing(utcDateTime) {
	// 转为正常的时间格式 年-月-日 时:分:秒
	const tPos = utcDateTime.indexOf('T');
	const zPos = utcDateTime.indexOf('Z');
	const yearMonthDay = utcDateTime.substr(0,tPos);
	const hourMinuteSecond = utcDateTime.substr(tPos+1,zPos-tPos-1);
	const newDateTime = yearMonthDay+' '+hourMinuteSecond; // 2017-03-31 08:02:06
	// 处理成为时间戳
	let timeStamp =((new Date(Date.parse(newDateTime)).getTime())/1000)+8*60*60;
	// 时间戳转为时间
	const beiJingDateTime = new Date(parseInt(timeStamp+'') * 1000).toLocaleString().replace(/年|月/g, '-').replace(/日/g, ' ');
	return beiJingDateTime; // 2017-03-31 16:02:06
}