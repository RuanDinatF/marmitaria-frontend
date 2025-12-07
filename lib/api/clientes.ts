import { apiClient } from "./client"
import type { ClienteDTO, ClienteCreateDTO } from "./types"

// API service for Clientes
export const clientesApi = {
  // GET /clientes
  async getAll(): Promise<ClienteDTO[]> {
    return await apiClient.request<ClienteDTO[]>("/clientes")
  },

  // GET /clientes/{id}
  async getById(id: number): Promise<ClienteDTO> {
    return await apiClient.request<ClienteDTO>(`/clientes/${id}`)
  },

  // POST /clientes
  async create(data: ClienteCreateDTO): Promise<ClienteDTO> {
    return await apiClient.request<ClienteDTO>("/clientes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // PUT /clientes/{id}
  async update(id: number, data: ClienteCreateDTO): Promise<ClienteDTO> {
    return await apiClient.request<ClienteDTO>(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // DELETE /clientes/{id}
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`/clientes/${id}`, {
      method: "DELETE",
    })
  },
}
