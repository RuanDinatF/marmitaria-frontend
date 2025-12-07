import { apiClient } from './client';
import { InsumoDTO, InsumoCreateDTO } from './types';

// Frontend Insumo type (used in components)
export interface Insumo {
  id: number;
  nome: string;
  quantidadeEstoque: number;
  unidadeMedida: {
    id: number;
    descricao: string;
    abreviacao: string;
  };
  custoUnitario: number;
  dataValidade: Date | null;
  tipoInsumo: {
    id: number;
    tipo: string;
  };
}

// Data mapping functions
function mapInsumoDTOToInsumo(dto: InsumoDTO): Insumo {
  // Parse date without timezone issues
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  return {
    id: dto.id,
    nome: dto.nome,
    quantidadeEstoque: dto.quantidadeEstoque,
    unidadeMedida: dto.unidadeMedida,
    custoUnitario: dto.custoUnitario,
    dataValidade: dto.dataValidade ? parseLocalDate(dto.dataValidade) : null,
    tipoInsumo: dto.tipoInsumo,
  };
}

export function mapInsumoToCreateDTO(insumo: Partial<Insumo>): InsumoCreateDTO {
  // Helper to convert Date to yyyy-MM-dd without timezone issues
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return {
    nome: insumo.nome!,
    tipoInsumoId: insumo.tipoInsumo!.id,
    quantidadeEstoque: insumo.quantidadeEstoque || 0,
    unidadeMedidaId: insumo.unidadeMedida!.id,
    custoUnitario: insumo.custoUnitario || 0,
    dataValidade: insumo.dataValidade ? toLocalDateString(insumo.dataValidade) : null,
  };
}

// API service
export const insumosApi = {
  // GET /insumos
  async getAll(): Promise<Insumo[]> {
    const dtos = await apiClient.request<InsumoDTO[]>('/insumos');
    return dtos.map(mapInsumoDTOToInsumo);
  },

  // GET /insumos/{id}
  async getById(id: number): Promise<Insumo> {
    const dto = await apiClient.request<InsumoDTO>(`/insumos/${id}`);
    return mapInsumoDTOToInsumo(dto);
  },

  // POST /insumos
  async create(data: InsumoCreateDTO): Promise<Insumo> {
    const dto = await apiClient.request<InsumoDTO>('/insumos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapInsumoDTOToInsumo(dto);
  },

  // PUT /insumos/{id}
  async update(id: number, data: InsumoCreateDTO): Promise<Insumo> {
    const dto = await apiClient.request<InsumoDTO>(`/insumos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapInsumoDTOToInsumo(dto);
  },

  // DELETE /insumos/{id}
  async delete(id: number): Promise<void> {
    await apiClient.request(`/insumos/${id}`, {
      method: 'DELETE',
    });
  },

  // DELETE /insumos/{id}?force=true
  async deleteWithFichaTecnica(id: number): Promise<void> {
    await apiClient.request(`/insumos/${id}?force=true`, {
      method: 'DELETE',
    });
  },
};
