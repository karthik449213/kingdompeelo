import { API_URL } from './utils';

export const api = {
  menu: {
    getAll: () => fetch(`${API_URL}/menu/dishes?limit=1000`).then(res => res.json()),
    getFull: () => fetch(`${API_URL}/menu/full`).then(res => res.json()),
<<<<<<< HEAD
    getStandalone: () => fetch(`${API_URL}/menu/dishes/standalone/all?limit=1000`).then(res => res.json()),
    getOrganizedMenu: () => fetch(`${API_URL}/menu/organized`).then(res => res.json()),
=======
    // New: fetch organized dishes (returns { standalone, categorized })
    getOrganized: () => fetch(`${API_URL}/menu/dishes/organized/all`).then(res => res.json()),
>>>>>>> 09951e78bb94b77059389bc03fcbc6ecb5529d71
  },
};
