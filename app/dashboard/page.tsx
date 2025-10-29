"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign, ShoppingCart, Package, AlertTriangle, Wallet, Users, TrendingUp, Calendar } from "lucide-react"

// Mock data - replace with actual API calls
const dashboardData = {
  totalVendasDia: 2450.0,
  numeroVendas: 18,
  produtosEstoqueBaixo: [
    { nome: "Arroz Branco", quantidadeAtual: 5, estoqueMinimo: 10, unidade: "kg" },
    { nome: "Feijão Preto", quantidadeAtual: 3, estoqueMinimo: 8, unidade: "kg" },
    { nome: "Frango", quantidadeAtual: 2, estoqueMinimo: 5, unidade: "kg" },
  ],
  insumosVencimento: [
    { nome: "Tomate", dataValidade: "2025-01-28", quantidade: 2, unidade: "kg" },
    { nome: "Alface", dataValidade: "2025-01-26", quantidade: 1.5, unidade: "kg" },
    { nome: "Cenoura", dataValidade: "2025-01-29", quantidade: 3, unidade: "kg" },
  ],
  saldoCaixa: 1850.5,
  clientesCredito: 12,
}

export default function DashboardPage() {
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
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> em relação a ontem
            </p>
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
            <div className="text-3xl font-bold text-orange-900">{formatCurrency(dashboardData.saldoCaixa)}</div>
            <p className="text-xs text-muted-foreground mt-1">caixa aberto</p>
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
                          {insumo.quantidade} {insumo.unidade} • Vence em {daysUntil} {daysUntil === 1 ? "dia" : "dias"}
                        </p>
                      </div>
                      <Badge variant={isUrgent ? "destructive" : "secondary"} className="ml-2">
                        {formatDate(insumo.dataValidade)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
