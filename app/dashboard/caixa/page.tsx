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
  Wallet,
  DollarSign,
  Calendar,
  X,
  TrendingUp,
  Clock,
  Lock,
  Unlock,
  Plus,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Receipt,
  History,
  Banknote,
  CreditCard,
  Search,
  Trash2,
} from "lucide-react"
import { caixaApi } from "@/lib/api/caixa"
import { type Caixa, ApiError } from "@/lib/api/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return "Erro ao processar requisição."
}

export default function CaixaPage() {
  const { toast } = useToast()
  const [caixas, setCaixas] = useState<Caixa[]>([])
  const [caixaAberto, setCaixaAberto] = useState<Caixa | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog states
  const [isAbrirDialogOpen, setIsAbrirDialogOpen] = useState(false)
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingCaixa, setViewingCaixa] = useState<Caixa | null>(null)

  // Form states
  const [saldoInicial, setSaldoInicial] = useState("")
  const [movimentacaoForm, setMovimentacaoForm] = useState({
    tipo: "ENTRADA",
    descricao: "",
    valor: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      const [caixasData, caixaAbertoData] = await Promise.all([caixaApi.getAll(), caixaApi.getAberto()])
      setCaixas(caixasData)
      setCaixaAberto(caixaAbertoData)
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

  const filteredCaixas = useMemo(() => {
    return caixas.filter(
      (caixa) =>
        caixa.id.toString().includes(searchTerm) ||
        caixa.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        format(caixa.dataAbertura, "dd/MM/yyyy").includes(searchTerm),
    )
  }, [caixas, searchTerm])

  // Calculate summary values for open cash register
  const saldoAtual = useMemo(() => {
    if (!caixaAberto) return 0
    const totalEntradas = caixaAberto.movimentacoes
      .filter((m) => m.tipo === "ENTRADA")
      .reduce((acc, m) => acc + m.valor, 0)
    const totalSaidas = caixaAberto.movimentacoes.filter((m) => m.tipo === "SAIDA").reduce((acc, m) => acc + m.valor, 0)
    return caixaAberto.saldoInicial + totalEntradas - totalSaidas
  }, [caixaAberto])

  const totalEntradas = useMemo(() => {
    if (!caixaAberto) return 0
    return caixaAberto.movimentacoes.filter((m) => m.tipo === "ENTRADA").reduce((acc, m) => acc + m.valor, 0)
  }, [caixaAberto])

  const totalSaidas = useMemo(() => {
    if (!caixaAberto) return 0
    return caixaAberto.movimentacoes.filter((m) => m.tipo === "SAIDA").reduce((acc, m) => acc + m.valor, 0)
  }, [caixaAberto])

  const handleAbrirCaixa = async () => {
    if (!saldoInicial || Number(saldoInicial) < 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um saldo inicial válido.",
        variant: "destructive",
      })
      return
    }

    try {
      const novoCaixa = await caixaApi.abrir({ saldoInicial: Number(saldoInicial) })
      setCaixaAberto(novoCaixa)
      setCaixas([novoCaixa, ...caixas])
      setSaldoInicial("")
      setIsAbrirDialogOpen(false)
      toast({ title: "Caixa aberto", description: "O caixa foi aberto com sucesso." })
    } catch (err) {
      toast({
        title: "Erro ao abrir caixa",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const handleFecharCaixa = async () => {
    if (!caixaAberto) return

    if (confirm("Tem certeza que deseja fechar o caixa?")) {
      try {
        const caixaFechado = await caixaApi.fechar(caixaAberto.id)
        setCaixaAberto(null)
        setCaixas(caixas.map((c) => (c.id === caixaFechado.id ? caixaFechado : c)))
        toast({ title: "Caixa fechado", description: "O caixa foi fechado com sucesso." })
      } catch (err) {
        toast({
          title: "Erro ao fechar caixa",
          description: getErrorMessage(err),
          variant: "destructive",
        })
      }
    }
  }

  const handleAddMovimentacao = async () => {
    if (!caixaAberto) return

    if (!movimentacaoForm.descricao || !movimentacaoForm.valor || Number(movimentacaoForm.valor) <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive",
      })
      return
    }

    try {
      const novaMovimentacao = await caixaApi.addMovimentacao({
        caixaId: caixaAberto.id,
        tipo: movimentacaoForm.tipo,
        descricao: movimentacaoForm.descricao,
        valor: Number(movimentacaoForm.valor),
      })

      setCaixaAberto({
        ...caixaAberto,
        movimentacoes: [...caixaAberto.movimentacoes, novaMovimentacao],
      })

      setMovimentacaoForm({ tipo: "ENTRADA", descricao: "", valor: "" })
      setIsMovimentacaoDialogOpen(false)
      toast({ title: "Movimentação registrada", description: "A movimentação foi adicionada." })
    } catch (err) {
      toast({
        title: "Erro ao registrar",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const handleViewCaixa = async (caixa: Caixa) => {
    try {
      const caixaDetalhado = await caixaApi.getById(caixa.id)
      setViewingCaixa(caixaDetalhado)
      setIsViewDialogOpen(true)
    } catch (err) {
      toast({
        title: "Erro ao carregar detalhes",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const handleDeletarCaixa = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este caixa? Todas as movimentações serão perdidas.")) {
      try {
        await caixaApi.delete(id)
        setCaixas(caixas.filter((c) => c.id !== id))
        toast({ title: "Caixa excluído", description: "O registro foi removido." })
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

  const getStatusBadge = (status: string) => {
    if (status === "ABERTO") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <Unlock className="w-3 h-3 mr-1" />
          Aberto
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
        <Lock className="w-3 h-3 mr-1" />
        Fechado
      </Badge>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Controle de Caixa
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie a abertura, fechamento e movimentações do caixa</p>
        </div>
        {!caixaAberto ? (
          <Button onClick={() => setIsAbrirDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Unlock className="w-4 h-4 mr-2" />
            Abrir Caixa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsMovimentacaoDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
            <Button onClick={handleFecharCaixa} variant="destructive">
              <Lock className="w-4 h-4 mr-2" />
              Fechar Caixa
            </Button>
          </div>
        )}
      </div>

      {/* Status do Caixa Atual */}
      {caixaAberto ? (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                Caixa Aberto - #{caixaAberto.id.toString().padStart(4, "0")}
              </CardTitle>
              <Badge className="bg-green-100 text-green-700">
                <Clock className="w-3 h-3 mr-1" />
                Aberto em {format(caixaAberto.dataAbertura, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white/60 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                  <Banknote className="h-4 w-4" />
                  Saldo Inicial
                </div>
                <div className="text-2xl font-bold text-green-800">{formatCurrency(caixaAberto.saldoInicial)}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                  <ArrowUpCircle className="h-4 w-4" />
                  Total Entradas
                </div>
                <div className="text-2xl font-bold text-blue-800">{formatCurrency(totalEntradas)}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-2 text-sm text-red-700 mb-1">
                  <ArrowDownCircle className="h-4 w-4" />
                  Total Saídas
                </div>
                <div className="text-2xl font-bold text-red-800">{formatCurrency(totalSaidas)}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center gap-2 text-sm text-orange-700 mb-1">
                  <DollarSign className="h-4 w-4" />
                  Saldo Atual
                </div>
                <div className="text-2xl font-bold text-orange-800">{formatCurrency(saldoAtual)}</div>
              </div>
            </div>

            {/* Movimentações do Caixa Aberto */}
            {caixaAberto.movimentacoes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Movimentações de Hoje
                </h3>
                <div className="bg-white/80 rounded-lg border border-green-100 overflow-hidden max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caixaAberto.movimentacoes.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-sm">{format(mov.dataHora, "HH:mm", { locale: ptBR })}</TableCell>
                          <TableCell>
                            {mov.tipo === "ENTRADA" ? (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                <ArrowUpCircle className="w-3 h-3 mr-1" />
                                Entrada
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                <ArrowDownCircle className="w-3 h-3 mr-1" />
                                Saída
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{mov.descricao}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              mov.tipo === "ENTRADA" ? "text-blue-700" : "text-red-700"
                            }`}
                          >
                            {mov.tipo === "ENTRADA" ? "+" : "-"}
                            {formatCurrency(mov.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="py-12 text-center">
            <Lock className="h-16 w-16 mx-auto text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Nenhum Caixa Aberto</h3>
            <p className="text-amber-600 mb-4">Abra um novo caixa para começar a registrar movimentações</p>
            <Button onClick={() => setIsAbrirDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Unlock className="w-4 h-4 mr-2" />
              Abrir Caixa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Total de Caixas</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{caixas.length}</div>
            <p className="text-xs text-orange-600/80">Registros no sistema</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Caixas Abertos</CardTitle>
            <Unlock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {caixas.filter((c) => c.status === "ABERTO").length}
            </div>
            <p className="text-xs text-green-600/80">Em operação</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Movimentado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(caixas.reduce((acc, c) => acc + (c.saldoFinal || 0), 0))}
            </div>
            <p className="text-xs text-blue-600/80">Saldo final acumulado</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Caixas Fechados</CardTitle>
            <Lock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">
              {caixas.filter((c) => c.status === "FECHADO").length}
            </div>
            <p className="text-xs text-gray-600/80">Finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Caixas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-orange-600" />
              Histórico de Caixas
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, status ou data..."
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
                <TableHead>Data Abertura</TableHead>
                <TableHead>Data Fechamento</TableHead>
                <TableHead>Saldo Inicial</TableHead>
                <TableHead>Saldo Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando caixas...
                  </TableCell>
                </TableRow>
              ) : filteredCaixas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum caixa encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCaixas.map((caixa) => (
                  <TableRow key={caixa.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono">
                        #{caixa.id.toString().padStart(4, "0")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {format(caixa.dataAbertura, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {caixa.dataFechamento ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {format(caixa.dataFechamento, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(caixa.saldoInicial)}</TableCell>
                    <TableCell className="font-medium">
                      {caixa.saldoFinal !== null ? (
                        <span className={caixa.saldoFinal >= caixa.saldoInicial ? "text-green-700" : "text-red-700"}>
                          {formatCurrency(caixa.saldoFinal)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(caixa.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewCaixa(caixa)}>
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                      {caixa.status === "FECHADO" && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeletarCaixa(caixa.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Abrir Caixa */}
      {isAbrirDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-green-600" />
                Abrir Caixa
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAbrirDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saldoInicial" className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-orange-600" />
                  Saldo Inicial
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                  <Input
                    id="saldoInicial"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={saldoInicial}
                    onChange={(e) => setSaldoInicial(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Informe o valor em dinheiro disponível ao abrir o caixa</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsAbrirDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAbrirCaixa} className="bg-green-600 hover:bg-green-700">
                <Unlock className="w-4 h-4 mr-2" />
                Abrir Caixa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Movimentação */}
      {isMovimentacaoDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Nova Movimentação
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMovimentacaoDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoMovimentacao" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Tipo de Movimentação
                </Label>
                <Select
                  value={movimentacaoForm.tipo}
                  onValueChange={(value) => setMovimentacaoForm({ ...movimentacaoForm, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-blue-600" />
                        Entrada
                      </div>
                    </SelectItem>
                    <SelectItem value="SAIDA">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        Saída
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricaoMovimentacao" className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-600" />
                  Descrição
                </Label>
                <Input
                  id="descricaoMovimentacao"
                  placeholder="Ex: Venda em dinheiro, Sangria, Troco..."
                  value={movimentacaoForm.descricao}
                  onChange={(e) => setMovimentacaoForm({ ...movimentacaoForm, descricao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMovimentacao" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  Valor
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                  <Input
                    id="valorMovimentacao"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacaoForm.valor}
                    onChange={(e) => setMovimentacaoForm({ ...movimentacaoForm, valor: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsMovimentacaoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMovimentacao} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Caixa */}
      {isViewDialogOpen && viewingCaixa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange-600" />
                Detalhes do Caixa #{viewingCaixa.id.toString().padStart(4, "0")}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsViewDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Informações do Caixa */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Data Abertura
                  </div>
                  <div className="font-medium">
                    {format(viewingCaixa.dataAbertura, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Data Fechamento
                  </div>
                  <div className="font-medium">
                    {viewingCaixa.dataFechamento
                      ? format(viewingCaixa.dataFechamento, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "-"}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                    <Banknote className="w-4 h-4" />
                    Saldo Inicial
                  </div>
                  <div className="font-bold text-green-800">{formatCurrency(viewingCaixa.saldoInicial)}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-orange-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Saldo Final
                  </div>
                  <div className="font-bold text-orange-800">
                    {viewingCaixa.saldoFinal !== null ? formatCurrency(viewingCaixa.saldoFinal) : "-"}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">{getStatusBadge(viewingCaixa.status)}</div>

              {/* Movimentações */}
              {viewingCaixa.movimentacoes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-600" />
                    Movimentações ({viewingCaixa.movimentacoes.length})
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingCaixa.movimentacoes.map((mov) => (
                          <TableRow key={mov.id}>
                            <TableCell className="text-sm">
                              {format(mov.dataHora, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {mov.tipo === "ENTRADA" ? (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                  <ArrowUpCircle className="w-3 h-3 mr-1" />
                                  Entrada
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                  <ArrowDownCircle className="w-3 h-3 mr-1" />
                                  Saída
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{mov.descricao}</TableCell>
                            <TableCell
                              className={`text-right font-medium ${
                                mov.tipo === "ENTRADA" ? "text-blue-700" : "text-red-700"
                              }`}
                            >
                              {mov.tipo === "ENTRADA" ? "+" : "-"}
                              {formatCurrency(mov.valor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {viewingCaixa.movimentacoes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma movimentação registrada neste caixa</p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t">
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
