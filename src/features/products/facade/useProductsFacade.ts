import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../../app/context/AppContext";
import {
  DEFAULT_CRITICAL_STOCK_THRESHOLD,
} from "../config/products.config";
import type {
  Product,
  ProductCategoryOption,
  ProductDeleteTarget,
  ProductFormData,
  ProductFormTarget,
  ProductListItem,
  ProductSortField,
  ProductStatusFilter,
  ProductStockStatus,
} from "../models/products.models";
import {
  createProduct,
  fetchProductCategories,
  fetchProducts,
  removeProduct,
  updateProduct,
} from "../services/products.service";

function getMargin(product: Product) {
  if (typeof product.margem === "number") {
    return product.margem;
  }

  if (!product.precoCompra || product.precoCompra <= 0 || product.precoVenda <= 0) {
    return null;
  }

  return ((product.precoVenda - product.precoCompra) / product.precoVenda) * 100;
}

function getVolumeLabel(product: Product) {
  if (!product.volume || !product.medida) {
    return null;
  }

  const measureLabel = product.medida === "UNIDADE" ? "un" : product.medida.toLowerCase();
  return `${product.volume}${measureLabel}`;
}

function getStockStatus(estoqueAtual: number, critico: number): ProductStockStatus {
  if (estoqueAtual <= 0) return "esgotado";
  if (estoqueAtual <= critico) return "critico";
  return "ok";
}

function toRemoteSortField(field: ProductSortField) {
  return field === "estoqueStatus" ? "estoqueAtual" : field;
}

function getStockFilters(status: ProductStatusFilter, threshold: number) {
  if (status === "esgotado") return { estoqueMax: 0 };
  if (status === "critico") return { estoqueMin: 1, estoqueMax: threshold };
  if (status === "ok") return { estoqueMin: threshold + 1 };
  return {};
}

export function useProductsFacade() {
  const { stockThresholds } = useApp();
  const criticalThreshold = stockThresholds?.critico ?? DEFAULT_CRITICAL_STOCK_THRESHOLD;
  const [categoryOptions, setCategoryOptions] = useState<ProductCategoryOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ProductDeleteTarget | null>(null);
  const [error, setError] = useState("");
  const [formTarget, setFormTarget] = useState<ProductFormTarget | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortAscending, setSortAscending] = useState(true);
  const [sortField, setSortField] = useState<ProductSortField>("nome");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("todos");
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [reloadVersion, setReloadVersion] = useState(0);
  const requestId = useRef(0);

  const loadProducts = async () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);

    try {
      const productsResult = await fetchProducts({
        categoriaId: selectedCategory === "todos" ? undefined : Number(selectedCategory),
        ...getStockFilters(statusFilter, criticalThreshold),
        nome: submittedSearch,
        ordenacao: `${toRemoteSortField(sortField)},${sortAscending ? "asc" : "desc"}`,
        page: currentPage - 1,
      });

      if (currentRequestId !== requestId.current) return;
      const nextTotalPages = Math.max(1, productsResult.totalPages);
      setTotalPages(nextTotalPages);
      setTotalProducts(productsResult.totalElements);
      if (currentPage > nextTotalPages) {
        setCurrentPage(nextTotalPages);
        return;
      }
      setRawProducts(productsResult.content);
      setError("");
    } catch {
      if (currentRequestId !== requestId.current) return;
      setRawProducts([]);
      setError("Não foi possível carregar os produtos.");
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    return () => { requestId.current += 1; };
  }, [currentPage, submittedSearch, selectedCategory, statusFilter, sortAscending, sortField, criticalThreshold, reloadVersion]);

  useEffect(() => {
    let isMounted = true;

    void fetchProductCategories()
      .then((categoriesResult) => {
        if (!isMounted) return;
        setCategoryOptions(categoriesResult);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Não foi possível carregar os produtos.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const products = useMemo<ProductListItem[]>(() => rawProducts.map((product) => ({
    ...product,
    estoqueStatus: getStockStatus(product.estoqueAtual, criticalThreshold),
    margemCalculada: getMargin(product),
    volumeLabel: getVolumeLabel(product),
  })), [criticalThreshold, rawProducts]);

  const categoryTabs = useMemo(() => [
    { id: "todos", nome: "Todos" },
    ...categoryOptions.map((category) => ({ id: String(category.id), nome: category.nome })),
  ], [categoryOptions]);

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const changeStatus = (status: ProductStatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const closeForm = () => {
    setFormTarget(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setFormTarget(null);
    setIsFormOpen(true);
  };

  const openEditForm = (target: ProductFormTarget) => {
    setFormTarget(target);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (target: ProductDeleteTarget) => {
    setDeleteTarget(target);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
  };

  const toggleSort = (field: ProductSortField) => {
    const nextSortAscending = sortField === field ? !sortAscending : true;
    const nextSortField = field;

    setSortField(nextSortField);
    setSortAscending(nextSortAscending);
    setCurrentPage(1);
  };

  const submitSearch = async () => {
    const normalizedSearch = search.trim();
    setSubmittedSearch(normalizedSearch);
    setCurrentPage(1);
    setReloadVersion((version) => version + 1);
  };

  const submitProduct = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await (formTarget
        ? updateProduct(formTarget, formData)
        : createProduct(formData));
      closeForm();
      await loadProducts();
    } catch {
      setError("Não foi possível salvar o produto.");
      throw new Error("PRODUCTS_SUBMIT_FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleteSubmitting(true);
    setError("");

    try {
      await removeProduct(deleteTarget);
      setDeleteTarget(null);
      await loadProducts();
    } catch {
      setError("Não foi possível excluir o produto.");
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  return {
    categoryOptions,
    categoryTabs,
    closeDeleteConfirm,
    closeForm,
    confirmDelete,
    criticalThreshold,
    currentPage,
    deleteTarget,
    error,
    filteredProductsCount: totalProducts,
    formTarget,
    isDeleteSubmitting,
    isFormOpen,
    isLoading,
    isSubmitting,
    openCreateForm,
    openDeleteConfirm,
    openEditForm,
    paginatedProducts: products,
    products,
    search,
    selectedCategory,
    setCurrentPage,
    setSearch,
    setSelectedCategory: changeCategory,
    setStatusFilter: changeStatus,
    sortAscending,
    sortField,
    statusFilter,
    submitSearch,
    submitProduct,
    toggleSort,
    totalPages,
  };
}