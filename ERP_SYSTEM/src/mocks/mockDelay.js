export const mockDelay = (data, ms = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));
