export const api = {
  get: async (path: string) => {
    const res = await fetch(path);
    return res.json();
  }
};
