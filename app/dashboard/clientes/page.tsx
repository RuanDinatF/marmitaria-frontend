"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  MapPin,
  Phone,
  Wallet,
  CreditCard,
  X,
  UserCircle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react"
import { clientesApi } from "@/lib/api/clientes"
import { type ClienteDTO, ApiError } from "@/lib/api/types"

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return "Erro ao processar requisição."
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<ClienteDTO | null>(null)
  const [viewingCliente, setViewingCliente] = useState<ClienteDTO | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    saldo: "",
    limiteCredito: false,
  })

  useEffect(() => {
    loadClientes()
  }, [])

  async function loadClientes() {
    try {
      setIsLoading(true)
      const data = await clientesApi.getAll()
      setClientes(data)
    } catch (err) {
      toast({
        title: "Erro ao carregar clientes",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClientes = useMemo(() => {
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone.includes(searchTerm) ||
        cliente.endereco.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [clientes, searchTerm])

  // Metrics
  const totalClientes = clientes.length
  const clientesComCredito = clientes.filter((c) => c.limiteCredito).length
  const saldoTotal = clientes.reduce((acc, c) => acc + c.saldo, 0)
  const clientesDevedores = clientes.filter((c) => c.saldo < 0).length

  const handleOpenCreateDialog = () => {
    setEditingCliente(null)
    setFormData({
      nome: "",
      endereco: "",
      telefone: "",
      saldo: "",
      limiteCredito: false,
    })
    setIsCreateDialogOpen(true)
  }

  const handleOpenEditDialog = (cliente: ClienteDTO) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      endereco: cliente.endereco,
      telefone: cliente.telefone,
      saldo: cliente.saldo.toString(),
      limiteCredito: cliente.limiteCredito,
    })
    setIsCreateDialogOpen(true)
  }

  const handleSalvarCliente = async () => {
    if (!formData.nome || !formData.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const clienteData = {
      nome: formData.nome,
      endereco: formData.endereco,
      telefone: formData.telefone,
      saldo: Number(formData.saldo) || 0,
      limiteCredito: formData.limiteCredito,
    }

    try {
      if (editingCliente) {
        await clientesApi.update(editingCliente.id, clienteData)
        toast({ title: "Cliente atualizado", description: `${formData.nome} atualizado com sucesso.` })
      } else {
        await clientesApi.create(clienteData)
        toast({ title: "Cliente cadastrado", description: `${formData.nome} cadastrado com sucesso.` })
      }
      setIsCreateDialogOpen(false)
      loadClientes()
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const handleDeletarCliente = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await clientesApi.delete(id)
        setClientes(clientes.filter((c) => c.id !== id))
        toast({ title: "Cliente excluído", description: "O cliente foi removido do sistema." })
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

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">Cadastro e controle de clientes da marmitaria</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{totalClientes}</div>
            <p className="text-xs text-orange-600/80">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Saldo Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoTotal >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatCurrency(saldoTotal)}
            </div>
            <p className="text-xs text-green-600/80">Créditos em conta</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Com Limite</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{clientesComCredito}</div>
            <p className="text-xs text-blue-600/80">Possuem crédito liberado</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Devedores</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{clientesDevedores}</div>
            <p className="text-xs text-red-600/80">Com saldo negativo</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
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
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Crédito</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-orange-50/50"
                    onClick={() => setViewingCliente(cliente)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-orange-500" />
                        {cliente.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {cliente.telefone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm max-w-[200px] truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {cliente.endereco || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1 font-medium ${cliente.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        <Wallet className="h-3 w-3" />
                        {formatCurrency(cliente.saldo)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cliente.limiteCredito ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Liberado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Bloqueado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditDialog(cliente)
                        }}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletarCliente(cliente.id)
                        }}
                      >
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

      {/* Modal de Visualização */}
      {viewingCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewingCliente.nome}</h2>
                  <p className="text-sm text-muted-foreground">Cliente #{viewingCliente.id}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingCliente(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium">{viewingCliente.telefone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p className="font-medium">{viewingCliente.endereco || "Não informado"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${viewingCliente.saldo >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className={`h-4 w-4 ${viewingCliente.saldo >= 0 ? "text-green-600" : "text-red-600"}`} />
                    <span className="text-xs text-muted-foreground">Saldo</span>
                  </div>
                  <p className={`text-xl font-bold ${viewingCliente.saldo >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {formatCurrency(viewingCliente.saldo)}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${viewingCliente.limiteCredito ? "bg-blue-50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard
                      className={`h-4 w-4 ${viewingCliente.limiteCredito ? "text-blue-600" : "text-gray-500"}`}
                    />
                    <span className="text-xs text-muted-foreground">Crédito</span>
                  </div>
                  <p
                    className={`text-xl font-bold ${viewingCliente.limiteCredito ? "text-blue-700" : "text-gray-500"}`}
                  >
                    {viewingCliente.limiteCredito ? "Liberado" : "Bloqueado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewingCliente(null)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setViewingCliente(null)
                  handleOpenEditDialog(viewingCliente)
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingCliente ? "Editar Cliente" : "Novo Cliente"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cliente *</Label>
                <div className="relative">
                  <Input
                    id="nome"
                    placeholder="Ex: Maria Silva"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="pl-9"
                  />
                  <UserCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <div className="relative">
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="pl-9"
                  />
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <div className="relative">
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="pl-9"
                  />
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo Inicial</Label>
                  <div className="relative">
                    <Input
                      id="saldo"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.saldo}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          saldo: e.target.value
                        })
                      }}
                      className="pl-9"
                    />
                    <Wallet className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Limite de Crédito</Label>
                  <div className="flex items-center gap-3 h-10 px-3 border rounded-md bg-gray-50">
                    <Switch
                      checked={formData.limiteCredito}
                      onCheckedChange={(checked) => {
                        const saldoAtual = Number(formData.saldo) || 0
                        
                        // Apenas avisa, mas permite a mudança
                        if (checked && saldoAtual <= 0) {
                          toast({
                            title: "Atenção",
                            description: "Você está liberando crédito para um cliente com saldo zero ou negativo.",
                            variant: "default",
                          })
                        }
                        
                        if (!checked && saldoAtual > 0) {
                          toast({
                            title: "Atenção",
                            description: "Você está bloqueando crédito de um cliente com saldo positivo.",
                            variant: "default",
                          })
                        }
                        
                        setFormData({ ...formData, limiteCredito: checked })
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.limiteCredito ? "Liberado" : "Bloqueado"}
                    </span>
                  </div>
                  {formData.limiteCredito && Number(formData.saldo) <= 0 && (
                    <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Crédito liberado para cliente com saldo zero/negativo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarCliente} className="bg-orange-600 hover:bg-orange-700">
                {editingCliente ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
