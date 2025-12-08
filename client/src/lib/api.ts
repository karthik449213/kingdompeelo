import { API_URL } from './utils';

export const api = {
  menu: {
    getFull: () => fetch(`${API_URL}/menu/full`).then(res => res.json()),
    // New: fetch organized dishes (returns { standalone, categorized })
    getOrganized: () => fetch(`${API_URL}/menu/dishes/organized/all`).then(res => res.json()),
  },
};
