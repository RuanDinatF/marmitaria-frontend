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

// Insumo types
export interface TipoInsumoDTO {
  id: number;
  tipo: string;
}

export interface UnidadeMedidaDTO {
  id: number;
  descricao: string;
  abreviacao: string;
}

export interface InsumoDTO {
  id: number;
  nome: string;
  quantidadeEstoque: number;
  unidadeMedida: UnidadeMedidaDTO;
  custoUnitario: number;
  dataValidade: string | null; // ISO date string from backend
  tipoInsumo: TipoInsumoDTO;
}

export interface InsumoCreateDTO {
  nome: string;
  tipoInsumoId: number;
  quantidadeEstoque: number;
  unidadeMedidaId: number;
  custoUnitario: number;
  dataValidade: string | null; // ISO date string to backend
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
