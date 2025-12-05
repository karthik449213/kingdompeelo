const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  menu: {
    getFull: () => fetch(`${API_BASE_URL}/menu/full`).then(res => res.json()),
  },
};
