import { apiClient } from "./client"
import type { Venda, VendaDTO, VendaCreateDTO, ClienteDTO } from "./types"

// Data mapping functions
function mapVendaDTOToVenda(dto: VendaDTO): Venda {
  // Parse date without timezone issues
  // Backend sends "2025-12-07", we need to create Date in local timezone
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  return {
    id: dto.id,
    cliente: dto.cliente,
    valorTotal: dto.valorTotal,
    desconto: dto.desconto,
    valorPago: dto.valorPago,
    dataVenda: parseLocalDate(dto.dataVenda),
    itens:
      dto.itens
        ?.filter((item) => item.produto) // Filter out items without produto
        .map((item) => ({
          id: item.id,
          produto: {
            id: item.produto.id,
            nome: item.produto.nome,
            id_tipo_produto: item.produto.tipoProdutoDTO?.id || item.produto.tipoProdutoId || 0,
            tipo_produto_nome: item.produto.tipoProdutoDTO?.tipo || item.produto.tipoProdutoNome || 'Sem tipo',
            quantidadeEstoque: item.produto.quantidadeEstoque,
            estoqueMinimo: item.produto.estoqueMinimo,
            preco_venda: item.produto.precoVenda,
            fichaTecnica: [],
          },
          quantidade: item.quantidade,
        })) || [],
  }
}

export function mapVendaToCreateDTO(
  venda: Partial<Venda> & { itens: { produtoId: number; quantidade: number }[] },
): VendaCreateDTO {
  // Helper to convert Date to yyyy-MM-dd without timezone issues
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return {
    clienteId: venda.cliente?.id || null,
    valorTotal: venda.valorTotal || 0,
    desconto: venda.desconto || 0,
    valorPago: venda.valorPago || 0,
    dataVenda: venda.dataVenda ? toLocalDateString(venda.dataVenda) : toLocalDateString(new Date()),
    itens: venda.itens,
  }
}

// API service
export const vendasApi = {
  // GET /vendas
  async getAll(): Promise<Venda[]> {
    const dtos = await apiClient.request<VendaDTO[]>("/vendas")
    return dtos.map(mapVendaDTOToVenda)
  },

  // GET /vendas/{id}
  async getById(id: number): Promise<Venda> {
    const dto = await apiClient.request<VendaDTO>(`/vendas/${id}`)
    return mapVendaDTOToVenda(dto)
  },

  // POST /vendas
  async create(data: VendaCreateDTO): Promise<Venda> {
    const dto = await apiClient.request<VendaDTO>("/vendas", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return mapVendaDTOToVenda(dto)
  },

  // PUT /vendas/{id}
  async update(id: number, data: VendaCreateDTO): Promise<Venda> {
    const dto = await apiClient.request<VendaDTO>(`/vendas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return mapVendaDTOToVenda(dto)
  },

  // DELETE /vendas/{id}
  async delete(id: number): Promise<void> {
    await apiClient.request(`/vendas/${id}`, {
      method: "DELETE",
    })
  },
}

// API for Clientes (auxiliary)
export const clientesApi = {
  async getAll(): Promise<ClienteDTO[]> {
    return await apiClient.request<ClienteDTO[]>("/clientes")
  },
}
