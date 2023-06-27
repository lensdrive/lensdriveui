const key = '__LOCALE';

export const setLocale = (val) => {
  localStorage.setItem(key, val);
};

export const getLocale = () => {
  const locale = localStorage.getItem(key);
  return locale;
};