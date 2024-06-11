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

export const formatTemplateDate = (date: string): string =>
  dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ');

export const reduceStringToCharsWithEllipsis = (str: string, maxLength: number = 50) =>
  str.length > maxLength ? str.split('').slice(0, maxLength).join('') + '...' : str;

// Removes any cases of 3+ line breaks and replaces them with 2
export const formatDescription = (description: string): string =>
  description.replace(/\n{3,}/g, '\n\n');
