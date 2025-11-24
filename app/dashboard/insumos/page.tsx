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
import { Plus, Search, Edit, Trash2, Package, Scale, DollarSign, CalendarIcon, Tag, X } from "lucide-react"
import { insumosApi, mapInsumoToCreateDTO, type Insumo } from "@/lib/api/insumos"
import { ApiError, type TipoInsumoDTO, type UnidadeMedidaDTO } from "@/lib/api/types"
import { tiposInsumoApi } from "@/lib/api/tipos-insumo"
import { unidadesMedidaApi } from "@/lib/api/unidades-medida"
import { format } from "date-fns"

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return "Erro ao processar requisição."
}

export default function InsumosPage() {
  const { toast } = useToast()
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [tiposInsumo, setTiposInsumo] = useState<TipoInsumoDTO[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadeMedidaDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    tipoInsumoId: "",
    quantidadeEstoque: "",
    unidadeMedidaId: "",
    custoUnitario: "",
    dataValidade: "",
  })

  useEffect(() => {
    loadInsumos()
    loadTiposInsumo()
    loadUnidadesMedida()
  }, [])

  async function loadInsumos() {
    try {
      setIsLoading(true)
      const data = await insumosApi.getAll()
      setInsumos(data)
    } catch (err) {
      toast({
        title: "Erro ao carregar insumos",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadTiposInsumo() {
    try {
      const data = await tiposInsumoApi.getAll()
      setTiposInsumo(data)
    } catch (err) {
      toast({
        title: "Erro ao carregar tipos de insumo",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  async function loadUnidadesMedida() {
    try {
      const data = await unidadesMedidaApi.getAll()
      setUnidadesMedida(data)
    } catch (err) {
      toast({
        title: "Erro ao carregar unidades de medida",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const filteredInsumos = useMemo(() => {
    return insumos.filter(
      (insumo) =>
        insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.tipoInsumo.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [insumos, searchTerm])

  const handleOpenCreateDialog = () => {
    setEditingInsumo(null)
    setFormData({
      nome: "",
      tipoInsumoId: "",
      quantidadeEstoque: "",
      unidadeMedidaId: "",
      custoUnitario: "",
      dataValidade: "",
    })
    setIsCreateDialogOpen(true)
  }

  const handleOpenEditDialog = (insumo: Insumo) => {
    setEditingInsumo(insumo)
    setFormData({
      nome: insumo.nome,
      tipoInsumoId: insumo.tipoInsumo.id.toString(),
      quantidadeEstoque: insumo.quantidadeEstoque.toString(),
      unidadeMedidaId: insumo.unidadeMedida.id.toString(),
      custoUnitario: insumo.custoUnitario.toString(),
      dataValidade: insumo.dataValidade ? format(insumo.dataValidade, "yyyy-MM-dd") : "",
    })
    setIsCreateDialogOpen(true)
  }

  const handleSalvarInsumo = async () => {
    if (!formData.nome || !formData.tipoInsumoId || !formData.unidadeMedidaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const insumoCreateDTO = {
      nome: formData.nome,
      tipoInsumoId: Number(formData.tipoInsumoId),
      quantidadeEstoque: Number(formData.quantidadeEstoque) || 0,
      unidadeMedidaId: Number(formData.unidadeMedidaId),
      custoUnitario: Number(formData.custoUnitario) || 0,
      dataValidade: formData.dataValidade || null,
    }

    try {
      if (editingInsumo) {
        await insumosApi.update(editingInsumo.id, insumoCreateDTO)
        toast({ title: "Insumo atualizado", description: `${formData.nome} atualizado com sucesso.` })
      } else {
        await insumosApi.create(insumoCreateDTO)
        toast({ title: "Insumo criado", description: `${formData.nome} criado com sucesso.` })
      }
      setIsCreateDialogOpen(false)
      loadInsumos()
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const handleDeletarInsumo = async (id: number) => {
    try {
      // Primeira tentativa: deletar sem forçar
      await insumosApi.delete(id)
      setInsumos(insumos.filter((i) => i.id !== id))
      toast({ title: "Insumo excluído", description: "O item foi removido do estoque." })
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      
      // Se o erro indica que está em uso em fichas técnicas
      if (errorMessage.includes("ficha") || errorMessage.includes("técnica")) {
        // Mostra confirmação para deletar com as fichas técnicas
        if (confirm(`${errorMessage}\n\nDeseja continuar e remover o insumo de todas as fichas técnicas?`)) {
          try {
            // Segunda tentativa: deletar forçando remoção das fichas
            await insumosApi.deleteWithFichaTecnica(id)
            setInsumos(insumos.filter((i) => i.id !== id))
            toast({ 
              title: "Insumo excluído", 
              description: "O insumo foi removido do estoque e de todas as fichas técnicas." 
            })
          } catch (err2) {
            toast({
              title: "Erro ao excluir",
              description: getErrorMessage(err2),
              variant: "destructive",
            })
          }
        }
      } else {
        // Outro tipo de erro
        toast({
          title: "Erro ao excluir",
          description: errorMessage,
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

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Gestão de Insumos
          </h1>
          <p className="text-muted-foreground mt-1">Controle de estoque, custos e validade dos ingredientes</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Insumo
        </Button>
      </div>

      {/* Cards de Resumo (Opcional, mas visualmente rico) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{insumos.length}</div>
            <p className="text-xs text-orange-600/80">Tipos distintos cadastrados</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Valor em Estoque</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(insumos.reduce((acc, curr) => acc + curr.custoUnitario * curr.quantidadeEstoque, 0))}
            </div>
            <p className="text-xs text-green-600/80">Custo total armazenado</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Itens Críticos</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {insumos.filter((i) => i.quantidadeEstoque < 10).length}
            </div>
            <p className="text-xs text-blue-600/80">Com estoque baixo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Inventário</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insumo..."
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
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Custo Unit.</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando insumos...
                  </TableCell>
                </TableRow>
              ) : filteredInsumos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum insumo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInsumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">{insumo.nome}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit gap-1 items-center">
                        <Tag className="w-3 h-3" />
                        {insumo.tipoInsumo.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={insumo.quantidadeEstoque < 10 ? "text-red-600 font-bold" : ""}>
                          {insumo.quantidadeEstoque}
                        </span>
                        <span className="text-muted-foreground text-sm">{insumo.unidadeMedida.abreviacao}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(insumo.custoUnitario)}</TableCell>
                    <TableCell>
                      {insumo.dataValidade ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="w-3 h-3" />
                          {format(insumo.dataValidade, "dd/MM/yyyy")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(insumo)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletarInsumo(insumo.id)}>
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

      {/* Modal de Criação/Edição */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingInsumo ? "Editar Insumo" : "Novo Insumo"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Insumo</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Arroz Branco"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipoInsumoId}
                    onValueChange={(value) => setFormData({ ...formData, tipoInsumoId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposInsumo.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={formData.unidadeMedidaId}
                    onValueChange={(value) => setFormData({ ...formData, unidadeMedidaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesMedida.map((unidade) => (
                        <SelectItem key={unidade.id} value={unidade.id.toString()}>
                          {unidade.descricao} ({unidade.abreviacao})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estoque">Qtd. Estoque</Label>
                  <div className="relative">
                    <Input
                      id="estoque"
                      type="number"
                      placeholder="0"
                      value={formData.quantidadeEstoque}
                      onChange={(e) => setFormData({ ...formData, quantidadeEstoque: e.target.value })}
                      className="pl-8"
                    />
                    <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo">Custo Unitário</Label>
                  <div className="relative">
                    <Input
                      id="custo"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.custoUnitario}
                      onChange={(e) => setFormData({ ...formData, custoUnitario: e.target.value })}
                      className="pl-8"
                    />
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validade">Data de Validade</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.dataValidade}
                  onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarInsumo} className="bg-orange-600 hover:bg-orange-700">
                {editingInsumo ? "Salvar Alterações" : "Criar Insumo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}