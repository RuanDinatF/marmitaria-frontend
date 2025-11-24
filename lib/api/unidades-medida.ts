import { apiClient } from './client';
import { UnidadeMedidaDTO } from './types';

// API service for UnidadeMedida
export const unidadesMedidaApi = {
  // GET /unidades-medida
  async getAll(): Promise<UnidadeMedidaDTO[]> {
    return await apiClient.request<UnidadeMedidaDTO[]>('/unidades-medida');
  },
};
