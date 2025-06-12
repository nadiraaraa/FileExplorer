import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

export const useFolder = (path = '', sortOption = 'name') => {
  return useQuery({
    queryKey: ['folder', path, sortOption],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/folder`, {
        params: {
          path,
          sortBy: sortOption
        }
      });
      return res.data;
    }
  });
};


export const useCreateFolder = (path) => {
  const queryClient = useQueryClient(); // ✅ Inside custom hook

  return useMutation({
    mutationFn: ({ path, name }) =>
      axios.post(`${API_BASE}/folder`, { path, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folder', path] }),
  });
};

export const useDeleteItem = (path) => {
  const queryClient = useQueryClient(); // ✅ Inside custom hook

  return useMutation({
    mutationFn: (itemPath) =>
      axios.delete(`${API_BASE}/item`, { data: { path: itemPath } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folder', path] }),
  });
};