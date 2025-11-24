import { apiClient } from './client';
import { TipoInsumoDTO } from './types';

// API service for TipoInsumo
export const tiposInsumoApi = {
  // GET /tipos-insumo
  async getAll(): Promise<TipoInsumoDTO[]> {
    return await apiClient.request<TipoInsumoDTO[]>('/tipos-insumo');
  },
};
