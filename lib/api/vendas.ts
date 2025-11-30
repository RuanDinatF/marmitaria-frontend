import { apiClient } from "./client"
import type { Venda, VendaDTO, VendaCreateDTO, ClienteDTO } from "./types"

// Data mapping functions
function mapVendaDTOToVenda(dto: VendaDTO): Venda {
  return {
    id: dto.id,
    cliente: dto.cliente,
    valorTotal: dto.valorTotal,
    desconto: dto.desconto,
    valorPago: dto.valorPago,
    dataVenda: new Date(dto.dataVenda),
    itens:
      dto.itens?.map((item) => ({
        id: item.id,
        produto: {
          id: item.produto.id,
          nome: item.produto.name,
          id_tipo_produto: item.produto.tipoProdutoDTO.id,
          tipo_produto_nome: item.produto.tipoProdutoDTO.tipo,
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
  return {
    clienteId: venda.cliente?.id || null,
    valorTotal: venda.valorTotal || 0,
    desconto: venda.desconto || 0,
    valorPago: venda.valorPago || 0,
    dataVenda: venda.dataVenda ? venda.dataVenda.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
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
