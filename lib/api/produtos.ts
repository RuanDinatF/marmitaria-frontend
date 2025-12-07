import { apiClient } from './client';
import { Produto, ProdutoDTO, ProdutoCreateDTO } from './types';

import { ItemFichaTecnica } from './types';

// Data mapping functions
function mapProdutoDTOToProduto(dto: ProdutoDTO, fichaTecnica: ItemFichaTecnica[] = []): Produto {
  return {
    id: dto.id,
    nome: dto.nome,
    id_tipo_produto: dto.tipoProdutoDTO?.id || dto.tipoProdutoId || 0,
    tipo_produto_nome: dto.tipoProdutoDTO?.tipo || dto.tipoProdutoNome || 'Sem tipo',
    quantidadeEstoque: dto.quantidadeEstoque,
    estoqueMinimo: dto.estoqueMinimo,
    preco_venda: dto.precoVenda,
    fichaTecnica: fichaTecnica,
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
    
    // Para cada produto, buscar sua ficha técnica
    const produtosComFicha = await Promise.all(
      dtos.map(async (dto) => {
        try {
          const fichaTecnica = await this.getFichaTecnica(dto.id);
          return mapProdutoDTOToProduto(dto, fichaTecnica);
        } catch (err) {
          // Se falhar ao buscar ficha técnica, retorna produto sem ficha
          console.warn(`Erro ao buscar ficha técnica do produto ${dto.id}:`, err);
          return mapProdutoDTOToProduto(dto, []);
        }
      })
    );
    
    return produtosComFicha;
  },

  // GET /products/{id}
  async getById(id: number): Promise<Produto> {
    const dto = await apiClient.request<ProdutoDTO>(`/products/${id}`);
    try {
      const fichaTecnica = await this.getFichaTecnica(id);
      return mapProdutoDTOToProduto(dto, fichaTecnica);
    } catch (err) {
      console.warn(`Erro ao buscar ficha técnica do produto ${id}:`, err);
      return mapProdutoDTOToProduto(dto, []);
    }
  },

  // GET /produtos/{produtoId}/itens-ficha
  async getFichaTecnica(produtoId: number): Promise<ItemFichaTecnica[]> {
    const items = await apiClient.request<any[]>(`/produtos/${produtoId}/itens-ficha`);
    
    // Mapear para o formato esperado pelo frontend
    return items.map(item => ({
      id: item.id, // ID do item da ficha técnica
      id_insumo: item.insumo.id,
      quantidade: item.quantidade,
      insumo: {
        id: item.insumo.id,
        nome: item.insumo.nome,
        custo_unitario: item.insumo.custoUnitario,
        unidade: item.unidadeMedida.abreviacao,
      }
    }));
  },

  // POST /products
  async create(data: ProdutoCreateDTO): Promise<Produto> {
    const dto = await apiClient.request<ProdutoDTO>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapProdutoDTOToProduto(dto);
  },

  // POST /produtos/{produtoId}/itens-ficha
  async addItemFichaTecnica(produtoId: number, item: { insumoId: number; quantidade: number; unidadeMedidaId: number }): Promise<void> {
    await apiClient.request(`/produtos/${produtoId}/itens-ficha`, {
      method: 'POST',
      body: JSON.stringify({
        ...item,
        produtoId: produtoId, // Incluir produtoId no body para validação
      }),
    });
  },

  // DELETE /itens-ficha/{id}
  async deleteItemFichaTecnica(itemId: number): Promise<void> {
    await apiClient.request(`/itens-ficha/${itemId}`, {
      method: 'DELETE',
    });
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
