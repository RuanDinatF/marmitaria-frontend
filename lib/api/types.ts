// Backend API types (as returned by API)
export interface TipoProdutoDTO {
  id: number;
  tipo: string;
}

export interface ProdutoDTO {
  id: number;
  name: string;
  tipoProdutoDTO: TipoProdutoDTO;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  precoVenda: number;
}

export interface ProdutoCreateDTO {
  nome: string;
  tipoProdutoId: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  precoVenda: number;
}

// Frontend types (used in components)
export interface ItemFichaTecnica {
  id_insumo: number;
  quantidade: number;
  insumo: {
    id: number;
    nome: string;
    custo_unitario: number;
    unidade: string;
  };
}

export interface Produto {
  id: number;
  nome: string;
  id_tipo_produto: number;
  tipo_produto_nome: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  preco_venda: number;
  fichaTecnica: ItemFichaTecnica[];
}

// Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}
