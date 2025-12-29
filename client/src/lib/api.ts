import { API_URL } from './utils';

export const api = {
  menu: {
    // Primary endpoint: organized menu structure
    getOrganized: () => fetch(`${API_URL}/menu/organized`).then(res => res.json()),
    // Paginated dishes endpoint (50 items per page, default to page 1)
    getDishes: (page = 1, limit = 50) => 
      fetch(`${API_URL}/menu/dishes?page=${page}&limit=${limit}`).then(res => res.json()),
  },
};
