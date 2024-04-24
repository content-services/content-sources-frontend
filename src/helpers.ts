import dayjs from 'dayjs';

// Removes null values and builds url params from a given object.
export const objectToUrlParams = (obj: { [key: string]: string | undefined }): string => {
  const keyList = Object.keys(obj).filter((key) => !!obj[key]);
  // Check each item for falsey value and filter

  if (!keyList.length) return '';

  let items = '';
  keyList.forEach((key, index) => {
    items += `${key}=${obj[key]}${index !== keyList.length - 1 ? '&' : ''}`;
  });
  return items;
};

export const formatDateDDMMMYYYY = (date: string, withTime?: boolean): string =>
  dayjs(date).format(`DD MMM YYYY${withTime ? ' - HH:mm:ss' : ''}`);

export const reduceStringToCharsWithEllipsis = (str: string, maxLength: number = 50) =>
  str.length > maxLength ? str.split('').slice(0, maxLength).join('') + '...' : str;

// Removes unnecessary newlines before or after spaces
export const formatDescription = (description: string): string => 
  description.replace(/(?<! )\n\s*\n(?![ ])/g, '\n');

