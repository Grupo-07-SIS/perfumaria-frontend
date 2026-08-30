import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../../app/context/AppContext";
import {
  DEFAULT_CRITICAL_STOCK_THRESHOLD,
  PRODUCTS_PAGE_SIZE,
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
  switch (field) {
    case "categoriaNome":
      return "categoriaNome";
    case "margem":
      return "precoVenda";
    case "estoqueStatus":
      return "estoqueAtual";
    default:
      return field;
  }
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

  const loadProducts = async ({ nextSearch, nextSortAscending, nextSortField }: {
    nextSearch?: string;
    nextSortAscending?: boolean;
    nextSortField?: ProductSortField;
  } = {}) => {
    const resolvedSearch = nextSearch ?? submittedSearch;
    const resolvedSortAscending = nextSortAscending ?? sortAscending;
    const resolvedSortField = nextSortField ?? sortField;

    setIsLoading(true);

    try {
      const productsResult = await fetchProducts({
        nome: resolvedSearch,
        ordenacao: `${toRemoteSortField(resolvedSortField)},${resolvedSortAscending ? "asc" : "desc"}`,
      });

      setRawProducts(productsResult);
      setError("");
    } catch {
      setError("Não foi possível carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    void Promise.all([
      fetchProducts({ nome: "", ordenacao: "nome,asc" }),
      fetchProductCategories(),
    ])
      .then(([productsResult, categoriesResult]) => {
        if (!isMounted) return;
        setRawProducts(productsResult);
        setCategoryOptions(categoriesResult);
        setError("");
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Não foi possível carregar os produtos.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
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

  const filteredProducts = useMemo(() => {
    const normalizedSearch = submittedSearch.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchSearch = !normalizedSearch
        || product.nome.toLowerCase().includes(normalizedSearch)
        || product.marca.toLowerCase().includes(normalizedSearch);
      const matchStatus = statusFilter === "todos" || product.estoqueStatus === statusFilter;
      const matchCategory = selectedCategory === "todos" || String(product.categoriaId) === selectedCategory;

      return matchSearch && matchStatus && matchCategory;
    });

    return filtered;
  }, [products, selectedCategory, statusFilter, submittedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PAGE_SIZE);
  }, [currentPage, filteredProducts]);

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
    void loadProducts({ nextSortAscending, nextSortField });
  };

  const submitSearch = async () => {
    const normalizedSearch = search.trim();
    setSubmittedSearch(normalizedSearch);
    setCurrentPage(1);
    await loadProducts({ nextSearch: normalizedSearch });
  };

  const submitProduct = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const savedProduct = formTarget
        ? await updateProduct(formTarget, formData)
        : await createProduct(formData);

      setRawProducts((currentProducts) => {
        if (formTarget) {
          return currentProducts.map((product) => product.id === savedProduct.id ? savedProduct : product);
        }

        return [...currentProducts, savedProduct];
      });
      closeForm();
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
      const deletedProductId = await removeProduct(deleteTarget);
      setRawProducts((currentProducts) => currentProducts.filter((product) => product.id !== deletedProductId));
      setDeleteTarget(null);
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
    filteredProductsCount: filteredProducts.length,
    formTarget,
    isDeleteSubmitting,
    isFormOpen,
    isLoading,
    isSubmitting,
    openCreateForm,
    openDeleteConfirm,
    openEditForm,
    paginatedProducts,
    products,
    search,
    selectedCategory,
    setCurrentPage,
    setSearch,
    setSelectedCategory,
    setStatusFilter,
    sortAscending,
    sortField,
    statusFilter,
    submitSearch,
    submitProduct,
    toggleSort,
    totalPages,
  };
}