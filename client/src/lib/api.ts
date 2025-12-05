import { API_URL } from './utils';

export const api = {
  menu: {
    getFull: () => fetch(`${API_URL}/menu/full`).then(res => res.json()),
  },
};
