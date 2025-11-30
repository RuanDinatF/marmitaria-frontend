// Backend API types (as returned by API)
export interface TipoProdutoDTO {
  id: number
  tipo: string
}

export interface ProdutoDTO {
  id: number
  name: string
  tipoProdutoDTO: TipoProdutoDTO
  quantidadeEstoque: number
  estoqueMinimo: number
  precoVenda: number
}

export interface ProdutoCreateDTO {
  nome: string
  tipoProdutoId: number
  quantidadeEstoque: number
  estoqueMinimo: number
  precoVenda: number
}

// Frontend types (used in components)
export interface ItemFichaTecnica {
  id_insumo: number
  quantidade: number
  insumo: {
    id: number
    nome: string
    custo_unitario: number
    unidade: string
  }
}

export interface Produto {
  id: number
  nome: string
  id_tipo_produto: number
  tipo_produto_nome: string
  quantidadeEstoque: number
  estoqueMinimo: number
  preco_venda: number
  fichaTecnica: ItemFichaTecnica[]
}

// Backend API types for Insumos
export interface TipoInsumoDTO {
  id: number
  tipo: string
}

export interface UnidadeMedidaDTO {
  id: number
  nome: string
  sigla: string
}

export interface InsumoDTO {
  id: number
  nome: string
  quantidadeEstoque: number
  unidadeMedida: UnidadeMedidaDTO
  custoUnitario: number
  dataValidade: string | null
  tipoInsumo: TipoInsumoDTO
}

export interface InsumoCreateDTO {
  nome: string
  quantidadeEstoque: number
  unidadeMedidaId: number
  custoUnitario: number
  dataValidade: string | null
  tipoInsumoId: number
}

// Frontend types for Insumos
export interface Insumo {
  id: number
  nome: string
  quantidadeEstoque: number
  unidadeMedida: UnidadeMedidaDTO
  custoUnitario: number
  dataValidade: Date | null
  tipoInsumo: TipoInsumoDTO
}

// Backend API types for Vendas
export interface ClienteDTO {
  id: number
  nome: string
  endereco: string
  telefone: string
  saldo: number
  limiteCredito: boolean
}

export interface ItemVendaDTO {
  id: number
  produto: ProdutoDTO
  quantidade: number
}

export interface VendaDTO {
  id: number
  cliente: ClienteDTO | null
  valorTotal: number
  desconto: number
  valorPago: number
  dataVenda: string
  itens: ItemVendaDTO[]
}

export interface VendaCreateDTO {
  clienteId: number | null
  valorTotal: number
  desconto: number
  valorPago: number
  dataVenda: string
  itens: { produtoId: number; quantidade: number }[]
}

// Frontend types for Vendas
export interface ItemVenda {
  id: number
  produto: Produto
  quantidade: number
}

export interface Venda {
  id: number
  cliente: ClienteDTO | null
  valorTotal: number
  desconto: number
  valorPago: number
  dataVenda: Date
  itens: ItemVenda[]
}

// Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string,
  ) {
    super(message || `API Error: ${status} ${statusText}`)
    this.name = "ApiError"
  }
}
