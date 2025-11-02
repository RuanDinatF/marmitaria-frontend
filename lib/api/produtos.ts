import { apiClient } from './client';
import { Produto, ProdutoDTO, ProdutoCreateDTO } from './types';

// Data mapping functions
function mapProdutoDTOToProduto(dto: ProdutoDTO): Produto {
  return {
    id: dto.id,
    nome: dto.name,
    id_tipo_produto: dto.tipoProdutoDTO.id,
    tipo_produto_nome: dto.tipoProdutoDTO.tipo,
    quantidadeEstoque: dto.quantidadeEstoque,
    estoqueMinimo: dto.estoqueMinimo,
    preco_venda: dto.precoVenda,
    fichaTecnica: [], // Empty array - not yet implemented in backend
  };
}

export function mapProdutoToCreateDTO(produto: Partial<Produto>): ProdutoCreateDTO {
  return {
    nome: produto.nome!,
    tipoProdutoId: produto.id_tipo_produto!,
    quantidadeEstoque: produto.quantidadeEstoque || 0,
    estoqueMinimo: produto.estoqueMinimo || 0,
    precoVenda: produto.preco_venda!,
  };
}

// API service
export const produtosApi = {
  // GET /products
  async getAll(): Promise<Produto[]> {
    const dtos = await apiClient.request<ProdutoDTO[]>('/products');
    return dtos.map(mapProdutoDTOToProduto);
  },

  // GET /products/{id}
  async getById(id: number): Promise<Produto> {
    const dto = await apiClient.request<ProdutoDTO>(`/products/${id}`);
    return mapProdutoDTOToProduto(dto);
  },

  // POST /products
  async create(data: ProdutoCreateDTO): Promise<Produto> {
    const dto = await apiClient.request<ProdutoDTO>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapProdutoDTOToProduto(dto);
  },

  // PUT /products/{id}
  async update(id: number, data: ProdutoCreateDTO): Promise<Produto> {
    const dto = await apiClient.request<ProdutoDTO>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapProdutoDTOToProduto(dto);
  },

  // DELETE /products/{id}
  async delete(id: number): Promise<void> {
    await apiClient.request(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
