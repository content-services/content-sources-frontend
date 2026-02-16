export const preventPageRerender = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
