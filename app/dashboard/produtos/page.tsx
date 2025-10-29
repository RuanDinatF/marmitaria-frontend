"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronUp, Package, AlertTriangle, DollarSign, X } from "lucide-react"

// Mock data
const tiposProduto = [
  { id: 1, nome: "Marmita Executiva" },
  { id: 2, nome: "Marmita Fitness" },
  { id: 3, nome: "Marmita Vegetariana" },
  { id: 4, nome: "Marmita Kids" },
]

const unidadesMedida = [
  { id: 1, nome: "Quilograma", abreviacao: "kg" },
  { id: 2, nome: "Grama", abreviacao: "g" },
  { id: 3, nome: "Litro", abreviacao: "L" },
  { id: 4, nome: "Mililitro", abreviacao: "ml" },
  { id: 5, nome: "Unidade", abreviacao: "un" },
]

const insumosDisponiveis = [
  { id: 1, nome: "Arroz Branco", custo_unitario: 6.5, unidade: "kg" },
  { id: 2, nome: "Feijão Preto", custo_unitario: 8.0, unidade: "kg" },
  { id: 3, nome: "Frango", custo_unitario: 12.0, unidade: "kg" },
  { id: 4, nome: "Carne Bovina", custo_unitario: 35.0, unidade: "kg" },
  { id: 5, nome: "Tomate", custo_unitario: 4.5, unidade: "kg" },
  { id: 6, nome: "Alface", custo_unitario: 3.0, unidade: "kg" },
  { id: 7, nome: "Cenoura", custo_unitario: 3.5, unidade: "kg" },
  { id: 8, nome: "Azeite", custo_unitario: 25.0, unidade: "L" },
]

const produtosIniciais = [
  {
    id: 1,
    nome: "Marmita Executiva - Frango",
    id_tipo_produto: 1,
    quantidadeEstoque: 15,
    estoqueMinimo: 10,
    preco_venda: 18.5,
    fichaTecnica: [
      { id_insumo: 1, quantidade: 0.15, insumo: insumosDisponiveis[0] },
      { id_insumo: 2, quantidade: 0.1, insumo: insumosDisponiveis[1] },
      { id_insumo: 3, quantidade: 0.2, insumo: insumosDisponiveis[2] },
      { id_insumo: 5, quantidade: 0.05, insumo: insumosDisponiveis[4] },
    ],
  },
  {
    id: 2,
    nome: "Marmita Fitness - Carne",
    id_tipo_produto: 2,
    quantidadeEstoque: 8,
    estoqueMinimo: 10,
    preco_venda: 22.0,
    fichaTecnica: [
      { id_insumo: 1, quantidade: 0.12, insumo: insumosDisponiveis[0] },
      { id_insumo: 4, quantidade: 0.15, insumo: insumosDisponiveis[3] },
      { id_insumo: 6, quantidade: 0.08, insumo: insumosDisponiveis[5] },
      { id_insumo: 7, quantidade: 0.06, insumo: insumosDisponiveis[6] },
    ],
  },
  {
    id: 3,
    nome: "Marmita Vegetariana",
    id_tipo_produto: 3,
    quantidadeEstoque: 12,
    estoqueMinimo: 8,
    preco_venda: 16.0,
    fichaTecnica: [
      { id_insumo: 1, quantidade: 0.15, insumo: insumosDisponiveis[0] },
      { id_insumo: 2, quantidade: 0.12, insumo: insumosDisponiveis[1] },
      { id_insumo: 5, quantidade: 0.1, insumo: insumosDisponiveis[4] },
      { id_insumo: 6, quantidade: 0.1, insumo: insumosDisponiveis[5] },
    ],
  },
]

type ItemFichaTecnica = {
  id_insumo: number
  quantidade: number
  insumo: {
    id: number
    nome: string
    custo_unitario: number
    unidade: string
  }
}

type Produto = {
  id: number
  nome: string
  id_tipo_produto: number
  quantidadeEstoque: number
  estoqueMinimo: number
  preco_venda: number
  fichaTecnica: ItemFichaTecnica[]
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    id_tipo_produto: "",
    quantidadeEstoque: "",
    estoqueMinimo: "",
    preco_venda: "",
  })
  const [fichaTecnica, setFichaTecnica] = useState<ItemFichaTecnica[]>([])
  const [novoInsumo, setNovoInsumo] = useState({ id_insumo: "", quantidade: "" })

  const filteredProdutos = produtos.filter((produto) => produto.nome.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusProduto = (produto: Produto) => {
    return produto.quantidadeEstoque < produto.estoqueMinimo ? "Estoque Baixo" : "Estoque OK"
  }

  const getTipoProdutoNome = (id: number) => {
    return tiposProduto.find((tipo) => tipo.id === id)?.nome || "N/A"
  }

  const calcularCustoTotal = (ficha: ItemFichaTecnica[]) => {
    return ficha.reduce((total, item) => {
      return total + item.quantidade * item.insumo.custo_unitario
    }, 0)
  }

  const handleOpenCreateDialog = () => {
    setEditingProduct(null)
    setFormData({
      nome: "",
      id_tipo_produto: "",
      quantidadeEstoque: "",
      estoqueMinimo: "",
      preco_venda: "",
    })
    setFichaTecnica([])
    setIsCreateDialogOpen(true)
  }

  const handleOpenEditDialog = (produto: Produto) => {
    setEditingProduct(produto)
    setFormData({
      nome: produto.nome,
      id_tipo_produto: produto.id_tipo_produto.toString(),
      quantidadeEstoque: produto.quantidadeEstoque.toString(),
      estoqueMinimo: produto.estoqueMinimo.toString(),
      preco_venda: produto.preco_venda.toString(),
    })
    setFichaTecnica(produto.fichaTecnica)
    setIsCreateDialogOpen(true)
  }

  const handleAdicionarInsumo = () => {
    if (!novoInsumo.id_insumo || !novoInsumo.quantidade) return

    const insumo = insumosDisponiveis.find((i) => i.id === Number.parseInt(novoInsumo.id_insumo))
    if (!insumo) return

    const novoItem: ItemFichaTecnica = {
      id_insumo: insumo.id,
      quantidade: Number.parseFloat(novoInsumo.quantidade),
      insumo: insumo,
    }

    setFichaTecnica([...fichaTecnica, novoItem])
    setNovoInsumo({ id_insumo: "", quantidade: "" })
  }

  const handleRemoverInsumo = (id_insumo: number) => {
    setFichaTecnica(fichaTecnica.filter((item) => item.id_insumo !== id_insumo))
  }

  const handleSalvarProduto = () => {
    if (!formData.nome || !formData.id_tipo_produto || !formData.preco_venda) return

    const novoProduto: Produto = {
      id: editingProduct ? editingProduct.id : produtos.length + 1,
      nome: formData.nome,
      id_tipo_produto: Number.parseInt(formData.id_tipo_produto),
      quantidadeEstoque: Number.parseInt(formData.quantidadeEstoque) || 0,
      estoqueMinimo: Number.parseInt(formData.estoqueMinimo) || 0,
      preco_venda: Number.parseFloat(formData.preco_venda),
      fichaTecnica: fichaTecnica,
    }

    if (editingProduct) {
      setProdutos(produtos.map((p) => (p.id === editingProduct.id ? novoProduto : p)))
    } else {
      setProdutos([...produtos, novoProduto])
    }

    setIsCreateDialogOpen(false)
  }

  const handleDeletarProduto = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      setProdutos(produtos.filter((p) => p.id !== id))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900">Gestão de Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos e fichas técnicas</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-orange-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-orange-900">
                    {editingProduct ? "Editar Produto" : "Criar Novo Produto"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Preencha as informações do produto e configure sua ficha técnica
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-orange-900 text-lg">Informações Básicas</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Marmita Executiva - Frango"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Produto</Label>
                    <Select
                      value={formData.id_tipo_produto}
                      onValueChange={(value) => setFormData({ ...formData, id_tipo_produto: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposProduto.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço de Venda</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.preco_venda}
                      onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estoque">Quantidade em Estoque</Label>
                    <Input
                      id="estoque"
                      type="number"
                      placeholder="0"
                      value={formData.quantidadeEstoque}
                      onChange={(e) => setFormData({ ...formData, quantidadeEstoque: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                    <Input
                      id="estoqueMinimo"
                      type="number"
                      placeholder="0"
                      value={formData.estoqueMinimo}
                      onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-orange-900 text-lg">Ficha Técnica</h3>
                  {fichaTecnica.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Custo Total: </span>
                      <span className="font-bold text-orange-900">
                        {formatCurrency(calcularCustoTotal(fichaTecnica))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Lista de insumos */}
                {fichaTecnica.length > 0 && (
                  <Card className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {fichaTecnica.map((item) => (
                          <div
                            key={item.id_insumo}
                            className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-orange-900">{item.insumo.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantidade} {item.insumo.unidade} × {formatCurrency(item.insumo.custo_unitario)} ={" "}
                                {formatCurrency(item.quantidade * item.insumo.custo_unitario)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoverInsumo(item.id_insumo)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Adicionar novo insumo */}
                <Card className="border-dashed border-2 border-orange-300">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="insumo">Insumo</Label>
                        <Select
                          value={novoInsumo.id_insumo}
                          onValueChange={(value) => setNovoInsumo({ ...novoInsumo, id_insumo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o insumo" />
                          </SelectTrigger>
                          <SelectContent>
                            {insumosDisponiveis
                              .filter((insumo) => !fichaTecnica.some((item) => item.id_insumo === insumo.id))
                              .map((insumo) => (
                                <SelectItem key={insumo.id} value={insumo.id.toString()}>
                                  {insumo.nome} ({formatCurrency(insumo.custo_unitario)}/{insumo.unidade})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full lg:w-40 space-y-2">
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={novoInsumo.quantidade}
                          onChange={(e) => setNovoInsumo({ ...novoInsumo, quantidade: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={handleAdicionarInsumo}
                        className="bg-orange-600 hover:bg-orange-700 w-full lg:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-orange-200 p-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarProduto} className="bg-orange-600 hover:bg-orange-700">
                {editingProduct ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{produtos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {produtos.filter((p) => p.quantidadeEstoque < p.estoqueMinimo).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">produtos precisam reposição</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {formatCurrency(produtos.reduce((acc, p) => acc + p.preco_venda, 0) / produtos.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">preço médio de venda</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>Visualize e gerencie todos os produtos cadastrados</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-orange-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50 hover:bg-orange-50">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold text-center">Estoque</TableHead>
                  <TableHead className="font-semibold text-center">Estoque Mín.</TableHead>
                  <TableHead className="font-semibold text-right">Preço</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <>
                    <TableRow key={produto.id} className="hover:bg-orange-50/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedProduct(expandedProduct === produto.id ? null : produto.id)}
                          className="h-8 w-8"
                        >
                          {expandedProduct === produto.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{getTipoProdutoNome(produto.id_tipo_produto)}</TableCell>
                      <TableCell className="text-center">{produto.quantidadeEstoque}</TableCell>
                      <TableCell className="text-center">{produto.estoqueMinimo}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(produto.preco_venda)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getStatusProduto(produto) === "Estoque OK" ? "default" : "destructive"}
                          className={
                            getStatusProduto(produto) === "Estoque OK"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {getStatusProduto(produto)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(produto)}
                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletarProduto(produto.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedProduct === produto.id && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-orange-50/30">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-orange-900">Ficha Técnica</h4>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Custo Total: </span>
                                <span className="font-bold text-orange-900">
                                  {formatCurrency(calcularCustoTotal(produto.fichaTecnica))}
                                </span>
                                <span className="text-muted-foreground ml-4">Margem: </span>
                                <span className="font-bold text-green-700">
                                  {(
                                    ((produto.preco_venda - calcularCustoTotal(produto.fichaTecnica)) /
                                      produto.preco_venda) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                            {produto.fichaTecnica.length > 0 ? (
                              <div className="grid gap-2 md:grid-cols-2">
                                {produto.fichaTecnica.map((item) => (
                                  <div
                                    key={item.id_insumo}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-orange-200"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">{item.insumo.nome}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.quantidade} {item.insumo.unidade} ×{" "}
                                        {formatCurrency(item.insumo.custo_unitario)}
                                      </p>
                                    </div>
                                    <span className="font-semibold text-orange-900">
                                      {formatCurrency(item.quantidade * item.insumo.custo_unitario)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum insumo cadastrado na ficha técnica
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}