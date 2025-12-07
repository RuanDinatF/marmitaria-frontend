"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign, ShoppingCart, Package, AlertTriangle, Wallet, Users, TrendingUp, Calendar, Loader2 } from "lucide-react"
import { vendasApi } from "@/lib/api/vendas"
import { caixaApi } from "@/lib/api/caixa"
import { clientesApi } from "@/lib/api/clientes"
import { produtosApi } from "@/lib/api/produtos"
import { insumosApi } from "@/lib/api/insumos"
import { useToast } from "@/hooks/use-toast"
import { formatToBrazilianDate } from "@/lib/utils/date"

interface DashboardData {
  totalVendasDia: number
  totalVendasOntem: number
  numeroVendas: number
  produtosEstoqueBaixo: Array<{
    nome: string
    quantidadeAtual: number
    estoqueMinimo: number
    unidade: string
  }>
  insumosVencimento: Array<{
    nome: string
    dataValidade: string
    quantidade: number
    unidade: string
  }>
  saldoCaixa: number | null
  clientesCredito: number
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalVendasDia: 0,
    totalVendasOntem: 0,
    numeroVendas: 0,
    produtosEstoqueBaixo: [],
    insumosVencimento: [],
    saldoCaixa: null,
    clientesCredito: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [vendas, caixaAberto, clientes, produtos, insumos] = await Promise.all([
        vendasApi.getAll(),
        caixaApi.getAberto().catch(() => null), // Ignore error if endpoint doesn't exist
        clientesApi.getAll(),
        produtosApi.getAll(),
        insumosApi.getAll(),
      ])

      // Calculate vendas do dia
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const ontem = new Date(hoje)
      ontem.setDate(ontem.getDate() - 1)

      const vendasHoje = vendas.filter((venda) => {
        const dataVenda = new Date(venda.dataVenda)
        dataVenda.setHours(0, 0, 0, 0)
        return dataVenda.getTime() === hoje.getTime()
      })

      const vendasOntem = vendas.filter((venda) => {
        const dataVenda = new Date(venda.dataVenda)
        dataVenda.setHours(0, 0, 0, 0)
        return dataVenda.getTime() === ontem.getTime()
      })

      const totalVendasDia = vendasHoje.reduce((sum, venda) => sum + venda.valorTotal, 0)
      const totalVendasOntem = vendasOntem.reduce((sum, venda) => sum + venda.valorTotal, 0)

      // Filter produtos com estoque baixo
      const produtosEstoqueBaixo = produtos
        .filter((produto) => produto.quantidadeEstoque < produto.estoqueMinimo)
        .map((produto) => ({
          nome: produto.nome,
          quantidadeAtual: produto.quantidadeEstoque,
          estoqueMinimo: produto.estoqueMinimo,
          unidade: "un", // Default unit for produtos
        }))

      // Filter insumos próximos ao vencimento (próximos 7 dias)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + 7)

      const insumosVencimento = insumos
        .filter((insumo) => {
          if (!insumo.dataValidade) return false
          const dataValidade = new Date(insumo.dataValidade)
          return dataValidade <= dataLimite && dataValidade >= new Date()
        })
        .map((insumo) => ({
          nome: insumo.nome,
          dataValidade: formatToBrazilianDate(insumo.dataValidade!),
          quantidade: insumo.quantidadeEstoque,
          unidade: insumo.unidadeMedida.abreviacao,
        }))
        .sort((a, b) => {
          // Parse datas brasileiras para comparação
          const [diaA, mesA, anoA] = a.dataValidade.split('/').map(Number)
          const [diaB, mesB, anoB] = b.dataValidade.split('/').map(Number)
          const dateA = new Date(anoA, mesA - 1, diaA)
          const dateB = new Date(anoB, mesB - 1, diaB)
          return dateA.getTime() - dateB.getTime()
        })

      // Get saldo do caixa aberto
      const saldoCaixa = caixaAberto ? calculateSaldoAtual(caixaAberto) : null

      // Count clientes com limite de crédito
      const clientesCredito = clientes.filter((cliente) => cliente.limiteCredito).length

      setDashboardData({
        totalVendasDia,
        totalVendasOntem,
        numeroVendas: vendasHoje.length,
        produtosEstoqueBaixo,
        insumosVencimento,
        saldoCaixa,
        clientesCredito,
      })
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      toast({
        title: "Erro ao carregar dashboard",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function calculateSaldoAtual(caixa: any): number {
    let saldo = caixa.saldoInicial
    for (const mov of caixa.movimentacoes) {
      if (mov.tipo === "ENTRADA") {
        saldo += mov.valor
      } else {
        saldo -= mov.valor
      }
    }
    return saldo
  }

  function calculatePercentualCrescimento(): number | null {
    if (dashboardData.totalVendasOntem === 0) {
      return dashboardData.totalVendasDia > 0 ? 100 : null
    }
    const crescimento =
      ((dashboardData.totalVendasDia - dashboardData.totalVendasOntem) / dashboardData.totalVendasOntem) * 100
    return crescimento
  }
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const getDaysUntilExpiration = (dateString: string) => {
    const today = new Date()
    const expirationDate = new Date(dateString)
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados do dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Erro ao carregar dashboard</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const percentualCrescimento = calculatePercentualCrescimento()

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900">Dashboard Principal</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("pt-BR", { dateStyle: "full" })}</span>
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total de vendas do dia */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas Hoje</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{formatCurrency(dashboardData.totalVendasDia)}</div>
            {percentualCrescimento !== null && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp
                  className={`w-3 h-3 ${percentualCrescimento >= 0 ? "text-green-600" : "text-red-600"}`}
                />
                <span className={percentualCrescimento >= 0 ? "text-green-600" : "text-red-600"}>
                  {percentualCrescimento >= 0 ? "+" : ""}
                  {percentualCrescimento.toFixed(1)}%
                </span>{" "}
                em relação a ontem
              </p>
            )}
            {percentualCrescimento === null && (
              <p className="text-xs text-muted-foreground mt-1">Sem dados de comparação</p>
            )}
          </CardContent>
        </Card>

        {/* Número de vendas */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{dashboardData.numeroVendas}</div>
            <p className="text-xs text-muted-foreground mt-1">vendas registradas hoje</p>
          </CardContent>
        </Card>

        {/* Saldo do caixa */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Caixa</CardTitle>
            <Wallet className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {dashboardData.saldoCaixa !== null ? formatCurrency(dashboardData.saldoCaixa) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.saldoCaixa !== null ? "caixa aberto" : "nenhum caixa aberto"}
            </p>
          </CardContent>
        </Card>

        {/* Clientes com crédito */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes com Crédito</CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{dashboardData.clientesCredito}</div>
            <p className="text-xs text-muted-foreground mt-1">com limite de crédito ativo</p>
          </CardContent>
        </Card>

        {/* Produtos com estoque baixo */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{dashboardData.produtosEstoqueBaixo.length}</div>
            <p className="text-xs text-muted-foreground mt-1">produtos precisam de reposição</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Produtos com estoque baixo - detalhado */}
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>Produtos com Estoque Baixo</CardTitle>
            </div>
            <CardDescription>Produtos que precisam de reposição urgente</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px] pr-4">
              {dashboardData.produtosEstoqueBaixo.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Nenhum produto com estoque baixo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.produtosEstoqueBaixo.map((produto, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-orange-900">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque mínimo: {produto.estoqueMinimo} {produto.unidade}
                        </p>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {produto.quantidadeAtual} {produto.unidade}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Insumos próximos ao vencimento */}
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>Insumos Próximos ao Vencimento</CardTitle>
            </div>
            <CardDescription>Insumos que vencem nos próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px] pr-4">
              {dashboardData.insumosVencimento.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Nenhum insumo próximo ao vencimento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.insumosVencimento.map((insumo, index) => {
                    const daysUntil = getDaysUntilExpiration(insumo.dataValidade)
                    const isUrgent = daysUntil <= 2

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isUrgent
                            ? "border-red-200 bg-red-50/50 hover:bg-red-50"
                            : "border-orange-100 bg-orange-50/50 hover:bg-orange-50"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-orange-900">{insumo.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {insumo.quantidade} {insumo.unidade} • Vence em {daysUntil}{" "}
                            {daysUntil === 1 ? "dia" : "dias"}
                          </p>
                        </div>
                        <Badge variant={isUrgent ? "destructive" : "secondary"} className="ml-2">
                          {formatDate(insumo.dataValidade)}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
