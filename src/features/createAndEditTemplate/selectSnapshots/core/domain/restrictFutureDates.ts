export const restrictFutureDates = (date: Date) => {
  if (date.getTime() > Date.now()) {
    return 'Cannot set a date in the future';
  }
  return '';
};
