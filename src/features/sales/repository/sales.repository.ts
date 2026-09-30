import { apiClient } from "../../../core/services/http-client";
import type { SaleCustomerDto, SaleCustomerRequestDto, SaleCustomersPageDto, SaleProductDto, SaleProductsPageDto, SaleRequestDto } from "./dto/sales.dto";

export const salesRepository = {
  async listProducts(): Promise<SaleProductDto[]> {
    const products: SaleProductDto[] = [];
    let page = 0;
    let totalPages = 1;
    do {
      const { data } = await apiClient.get<SaleProductsPageDto>("/produtos", { params: { page, size: 100, ordenacao: "nome,asc" } });
      products.push(...data.content);
      totalPages = data.totalPages;
      page += 1;
    } while (page < totalPages);
    return products;
  },
  async listCustomers(): Promise<SaleCustomerDto[]> {
    const customers: SaleCustomerDto[] = [];
    let page = 0;
    let totalPages = 1;
    do {
      const { data } = await apiClient.get<SaleCustomersPageDto>("/clientes", { params: { page, size: 100, status: 1 } });
      customers.push(...data.content);
      totalPages = data.totalPages;
      page += 1;
    } while (page < totalPages);
    return customers;
  },
  async createSale(payload: SaleRequestDto): Promise<void> {
    await apiClient.post<void>("/vendas", payload);
  },
  async createCustomer(payload: SaleCustomerRequestDto): Promise<SaleCustomerDto> {
    return (await apiClient.post<SaleCustomerDto>("/clientes", payload)).data;
  },
};
