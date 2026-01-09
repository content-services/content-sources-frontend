import dayjs from 'dayjs';

export const formatDateDDMMMYYYY = (date: string, withTime?: boolean): string => {
  const d = dayjs(date);
  if (d.isBefore(dayjs('0001-01-02'))) {
    return `01 Jan 0001${withTime ? ' - 00:00:00' : ''}`;
  }

  return d.format(`DD MMM YYYY${withTime ? ' - HH:mm:ss' : ''}`);
};
