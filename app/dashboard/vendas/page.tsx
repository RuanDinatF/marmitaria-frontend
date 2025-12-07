"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ShoppingCart,
  DollarSign,
  Calendar,
  User,
  Package,
  X,
  Percent,
  CreditCard,
  TrendingUp,
  Receipt,
  Minus,
} from "lucide-react"
import { vendasApi, clientesApi, mapVendaToCreateDTO } from "@/lib/api/vendas"
import { produtosApi } from "@/lib/api/produtos"
import { caixaApi } from "@/lib/api/caixa"
import { type Venda, type ClienteDTO, type Produto, ApiError } from "@/lib/api/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatToInputDate, parseInputDate } from "@/lib/utils/date"

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return "Erro ao processar requisição."
}

export default function VendasPage() {
  const { toast } = useToast()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingVenda, setViewingVenda] = useState<Venda | null>(null)
  const [hasCaixaAberto, setHasCaixaAberto] = useState<boolean>(false)

  // Form state
  const [formData, setFormData] = useState({
    clienteId: "",
    dataVenda: formatToInputDate(new Date()),
    desconto: "",
    valorPago: "",
  })

  // Items in sale
  const [itensVenda, setItensVenda] = useState<{ produtoId: number; quantidade: number; produto?: Produto }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      const [vendasData, clientesData, produtosData, caixaAberto] = await Promise.all([
        vendasApi.getAll(),
        clientesApi.getAll(),
        produtosApi.getAll(),
        caixaApi.getAberto().catch(() => null),
      ])
      setVendas(vendasData)
      setClientes(clientesData)
      setProdutos(produtosData)
      setHasCaixaAberto(caixaAberto !== null)
    } catch (err) {
      toast({
        title: "Erro ao carregar dados",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVendas = useMemo(() => {
    return vendas.filter(
      (venda) =>
        venda.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.id.toString().includes(searchTerm),
    )
  }, [vendas, searchTerm])

  // Calculate totals
  const valorTotalItens = useMemo(() => {
    return itensVenda.reduce((acc, item) => {
      const produto = produtos.find((p) => p.id === item.produtoId)
      return acc + (produto?.preco_venda || 0) * item.quantidade
    }, 0)
  }, [itensVenda, produtos])

  const valorComDesconto = useMemo(() => {
    const desconto = Number(formData.desconto) || 0
    return valorTotalItens - desconto
  }, [valorTotalItens, formData.desconto])

  const handleOpenCreateDialog = () => {
    if (!hasCaixaAberto) {
      toast({
        title: "Caixa não está aberto",
        description: "É necessário abrir o caixa antes de realizar vendas. Acesse a página de Caixa para abrir um novo caixa.",
        variant: "destructive",
      })
      return
    }
    setFormData({
      clienteId: "",
      dataVenda: formatToInputDate(new Date()),
      desconto: "",
      valorPago: "",
    })
    setItensVenda([])
    setIsCreateDialogOpen(true)
  }

  const handleViewVenda = (venda: Venda) => {
    setViewingVenda(venda)
    setIsViewDialogOpen(true)
  }

  const handleAddItem = () => {
    setItensVenda([...itensVenda, { produtoId: 0, quantidade: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItensVenda(itensVenda.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: "produtoId" | "quantidade", value: number) => {
    const updated = [...itensVenda]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "produtoId") {
      updated[index].produto = produtos.find((p) => p.id === value)
    }
    setItensVenda(updated)
  }

  const handleSalvarVenda = async () => {
    if (itensVenda.length === 0 || itensVenda.some((item) => !item.produtoId || item.quantidade <= 0)) {
      toast({
        title: "Itens inválidos",
        description: "Adicione pelo menos um produto com quantidade válida.",
        variant: "destructive",
      })
      return
    }

    const vendaData = {
      cliente: formData.clienteId ? clientes.find((c) => c.id === Number(formData.clienteId)) : null,
      valorTotal: valorTotalItens,
      desconto: Number(formData.desconto) || 0,
      valorPago: Number(formData.valorPago) || valorComDesconto,
      dataVenda: parseInputDate(formData.dataVenda),
      itens: itensVenda.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
    }

    try {
      const createDTO = mapVendaToCreateDTO(vendaData)
      console.log('[VENDA] Dados sendo enviados:', createDTO)
      console.log('[VENDA] Data original:', vendaData.dataVenda)
      console.log('[VENDA] Data no DTO:', createDTO.dataVenda)
      
      await vendasApi.create(createDTO)
      toast({ title: "Venda registrada", description: "A venda foi salva com sucesso." })
      setIsCreateDialogOpen(false)
      loadData()
    } catch (err) {
      console.error('[VENDA] Erro ao criar venda:', err)
      const errorMessage = getErrorMessage(err)
      console.log('[VENDA] Mensagem de erro:', errorMessage)
      toast({
        title: "Erro ao salvar venda",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDeletarVenda = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      try {
        await vendasApi.delete(id)
        setVendas(vendas.filter((v) => v.id !== id))
        toast({ title: "Venda excluída", description: "O registro foi removido." })
      } catch (err) {
        toast({
          title: "Erro ao excluir",
          description: getErrorMessage(err),
          variant: "destructive",
        })
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (venda: Venda) => {
    const valorFinal = venda.valorTotal - venda.desconto
    if (venda.valorPago >= valorFinal) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CreditCard className="w-3 h-3 mr-1" />
          Pago
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        <CreditCard className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Gestão de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">Registre e acompanhe todas as vendas realizadas</p>
        </div>
        <Button 
          onClick={handleOpenCreateDialog} 
          className={hasCaixaAberto ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-400 hover:bg-gray-500"}
          title={!hasCaixaAberto ? "É necessário abrir o caixa antes de realizar vendas" : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Alerta de caixa fechado */}
      {!hasCaixaAberto && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Caixa não está aberto</h3>
                <p className="text-sm text-red-700 mt-1">
                  É necessário abrir o caixa antes de realizar vendas. Acesse a página de{" "}
                  <a href="/dashboard/caixa" className="font-semibold underline hover:text-red-900">
                    Caixa
                  </a>{" "}
                  para abrir um novo caixa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Total de Vendas</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{vendas.length}</div>
            <p className="text-xs text-orange-600/80">Vendas realizadas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(vendas.reduce((acc, v) => acc + v.valorTotal, 0))}
            </div>
            <p className="text-xs text-green-600/80">Valor bruto</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(vendas.reduce((acc, v) => acc + v.valorPago, 0))}
            </div>
            <p className="text-xs text-blue-600/80">Valor efetivo</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Descontos</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(vendas.reduce((acc, v) => acc + v.desconto, 0))}
            </div>
            <p className="text-xs text-purple-600/80">Total concedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Vendas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Carregando vendas...
                  </TableCell>
                </TableRow>
              ) : filteredVendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono">
                        #{venda.id.toString().padStart(4, "0")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {venda.cliente?.nome || "Consumidor Final"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {format(venda.dataVenda, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(venda.valorTotal)}</TableCell>
                    <TableCell>
                      {venda.desconto > 0 ? (
                        <span className="text-red-600">-{formatCurrency(venda.desconto)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-green-700">{formatCurrency(venda.valorPago)}</TableCell>
                    <TableCell>{getStatusBadge(venda)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewVenda(venda)}>
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletarVenda(venda.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Criação de Venda */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                Nova Venda
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select
                    value={formData.clienteId}
                    onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Consumidor Final" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Consumidor Final</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataVenda">Data da Venda</Label>
                  <Input
                    id="dataVenda"
                    type="date"
                    value={formData.dataVenda}
                    onChange={(e) => setFormData({ ...formData, dataVenda: e.target.value })}
                  />
                </div>
              </div>

              {/* Itens da Venda */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Itens da Venda</Label>
                  <Button variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                {itensVenda.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item adicionado</p>
                    <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itensVenda.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <Select
                            value={item.produtoId ? item.produtoId.toString() : ""}
                            onValueChange={(value) => handleUpdateItem(index, "produtoId", Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {produtos.map((produto) => (
                                <SelectItem key={produto.id} value={produto.id.toString()}>
                                  {produto.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleUpdateItem(index, "quantidade", Number(e.target.value))}
                            className="text-center"
                          />
                        </div>
                        <div className="w-28 text-right font-medium">
                          {item.produtoId && produtos.find((p) => p.id === item.produtoId)
                            ? formatCurrency(
                                (produtos.find((p) => p.id === item.produtoId)?.preco_venda || 0) * item.quantidade,
                              )
                            : "-"}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                          <Minus className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(valorTotalItens)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="desconto" className="text-sm text-muted-foreground w-20">
                    Desconto:
                  </Label>
                  <div className="relative flex-1">
                    <Input
                      id="desconto"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.desconto}
                      onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                      className="pl-8"
                    />
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-700">{formatCurrency(valorComDesconto)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="valorPago" className="text-sm text-muted-foreground w-20">
                    Valor Pago:
                  </Label>
                  <div className="relative flex-1">
                    <Input
                      id="valorPago"
                      type="number"
                      step="0.01"
                      placeholder={valorComDesconto.toFixed(2)}
                      value={formData.valorPago}
                      onChange={(e) => setFormData({ ...formData, valorPago: e.target.value })}
                      className="pl-8"
                    />
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarVenda} className="bg-orange-600 hover:bg-orange-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Finalizar Venda
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewDialogOpen && viewingVenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" />
                Venda #{viewingVenda.id.toString().padStart(4, "0")}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsViewDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {viewingVenda.cliente?.nome || "Consumidor Final"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(viewingVenda.dataVenda, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Itens</p>
                <div className="space-y-2">
                  {viewingVenda.itens.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>
                        {item.quantidade}x {item.produto.nome}
                      </span>
                      <span className="font-medium">{formatCurrency(item.produto.preco_venda * item.quantidade)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(viewingVenda.valorTotal)}</span>
                </div>
                {viewingVenda.desconto > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(viewingVenda.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-700">
                    {formatCurrency(viewingVenda.valorTotal - viewingVenda.desconto)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Pago:</span>
                  <span className="font-medium">{formatCurrency(viewingVenda.valorPago)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
