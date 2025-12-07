import { apiClient } from "./client"
import type { 
  CaixaResponseDTO, 
  CaixaRequestDTO, 
  MovimentacaoCaixaCreateDTO,
  MovimentacaoCaixaDTO,
  Caixa,
  Movimentacao
} from "./types"

// Helper function to convert LocalDateTime string to Date
function parseDateTime(dateTimeString: string | null): Date | null {
  if (!dateTimeString) return null
  return new Date(dateTimeString)
}

// Helper function to convert MovimentacaoCaixaDTO to Movimentacao
function mapMovimentacaoDTO(dto: MovimentacaoCaixaDTO): Movimentacao {
  return {
    id: dto.id,
    tipo: dto.tipo,
    descricao: dto.descricao,
    valor: dto.valor,
    dataHora: parseDateTime(dto.dataHora)!,
  }
}

// Helper function to convert CaixaResponseDTO to Caixa
function mapCaixaResponseDTO(dto: CaixaResponseDTO): Caixa {
  return {
    id: dto.id,
    saldoInicial: dto.valorInicial,
    saldoFinal: dto.valorFinal,
    dataAbertura: parseDateTime(dto.dataAbertura)!,
    dataFechamento: parseDateTime(dto.dataFechamento),
    status: dto.status,
    movimentacoes: dto.movimentacoes.map(mapMovimentacaoDTO),
  }
}

// API service for Caixa
export const caixaApi = {
  // GET /caixa
  async getAll(): Promise<Caixa[]> {
    const dtos = await apiClient.request<CaixaResponseDTO[]>("/caixa")
    return dtos.map(mapCaixaResponseDTO)
  },

  // GET /caixa/{id}
  async getById(id: number): Promise<Caixa> {
    const dto = await apiClient.request<CaixaResponseDTO>(`/caixa/${id}`)
    return mapCaixaResponseDTO(dto)
  },

  // POST /caixa/abrir
  async abrir(data: { saldoInicial: number }): Promise<Caixa> {
    const requestDTO: CaixaRequestDTO = {
      valorInicial: data.saldoInicial,
    }
    const dto = await apiClient.request<CaixaResponseDTO>("/caixa/abrir", {
      method: "POST",
      body: JSON.stringify(requestDTO),
    })
    return mapCaixaResponseDTO(dto)
  },

  // POST /caixa/movimentacao
  async addMovimentacao(data: MovimentacaoCaixaCreateDTO): Promise<Movimentacao> {
    const dto = await apiClient.request<MovimentacaoCaixaDTO>("/caixa/movimentacao", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return mapMovimentacaoDTO(dto)
  },

  // PUT /caixa/{id}/fechar
  async fechar(id: number): Promise<Caixa> {
    const dto = await apiClient.request<CaixaResponseDTO>(`/caixa/${id}/fechar`, {
      method: "PUT",
    })
    return mapCaixaResponseDTO(dto)
  },

  // DELETE /caixa/{id}
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`/caixa/${id}`, {
      method: "DELETE",
    })
  },

  // GET /caixa/aberto
  async getAberto(): Promise<Caixa | null> {
    try {
      const dto = await apiClient.request<CaixaResponseDTO>("/caixa/aberto")
      return mapCaixaResponseDTO(dto)
    } catch (error) {
      // If no caixa is open, backend might return 404 or empty response
      // Return null in this case
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null
      }
      throw error
    }
  },
}
