import { API_URL } from './utils';

export const api = {
  menu: {
    getAll: () => fetch(`${API_URL}/menu/dishes?limit=1000`).then(res => res.json()),
    getFull: () => fetch(`${API_URL}/menu/full`).then(res => res.json()),
    getOrganizedMenu: () => fetch(`${API_URL}/menu/organized`).then(res => res.json()),
    getStandalone: () => fetch(`${API_URL}/menu/dishes/standalone/all?limit=1000`).then(res => res.json()),
    getOrganized: () => fetch(`${API_URL}/menu/organized`).then(res => res.json()),
  },
};
