import dayjs from 'dayjs';

export const formatTemplateDate = (date: string): string =>
  dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ');
