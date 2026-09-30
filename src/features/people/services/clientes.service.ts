import type { Cliente, ClienteModalFormValues, PeopleListParams } from "../models/people.models";
import { clientesRepository } from "../repository/clientes.repository";
import { toClienteModel, toClienteRequestDto } from "../repository/mapper/cliente.mapper";

export async function fetchClientes(params?: PeopleListParams) {
  return (await clientesRepository.listClientes(params)).map(toClienteModel);
}
export async function createCliente(values: ClienteModalFormValues) {
  return toClienteModel(await clientesRepository.createCliente(toClienteRequestDto(values)));
}
export async function updateCliente(cliente: Cliente, values: ClienteModalFormValues) {
  return toClienteModel(await clientesRepository.updateCliente(cliente.id, toClienteRequestDto(values)));
}
export async function removeCliente(cliente: Cliente) {
  await clientesRepository.deleteCliente(cliente.id);
  return cliente.id;
}
export async function reactivateCliente(cliente: Cliente): Promise<Cliente> {
  const response = await clientesRepository.reactivateCliente(cliente.id);
  // Endpoint may answer 204 without a body.
  return response ? toClienteModel(response) : { ...cliente, ativo: true };
}