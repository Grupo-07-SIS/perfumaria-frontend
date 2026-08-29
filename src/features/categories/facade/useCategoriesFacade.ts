import { useEffect, useMemo, useState } from "react";
import { CATEGORIES_PAGE_SIZE } from "../config/categories.config";
import type {
  Category,
  CategoryDeleteTarget,
  CategoryFormData,
  CategoryFormTarget,
} from "../models/categories.models";
import {
  createCategory,
  fetchCategories,
  removeCategory,
  updateCategory,
} from "../services/categories.service";

function sortByName(categories: Category[]) {
  return [...categories].sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
}

export function useCategoriesFacade() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDeleteTarget | null>(null);
  const [error, setError] = useState("");
  const [formTarget, setFormTarget] = useState<CategoryFormTarget | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void fetchCategories()
      .then((result) => {
        if (!isMounted) return;
        setCategories(sortByName(result));
        setError("");
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Não foi possível carregar as categorias.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / CATEGORIES_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * CATEGORIES_PAGE_SIZE;
    return categories.slice(startIndex, startIndex + CATEGORIES_PAGE_SIZE);
  }, [categories, currentPage]);

  const closeForm = () => {
    setFormTarget(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setFormTarget(null);
    setIsFormOpen(true);
  };

  const openEditForm = (target: CategoryFormTarget) => {
    setFormTarget(target);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (target: CategoryDeleteTarget) => {
    setDeleteTarget(target);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
  };

  const submitCategory = async (formData: CategoryFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const savedCategory = formTarget
        ? await updateCategory(formTarget, formData)
        : await createCategory(formData);

      setCategories((currentCategories) => {
        const nextCategories = formTarget
          ? currentCategories.map((category) => category.id === savedCategory.id ? savedCategory : category)
          : [...currentCategories, savedCategory];

        return sortByName(nextCategories);
      });
      closeForm();
    } catch {
      setError("Não foi possível salvar a categoria.");
      throw new Error("CATEGORIES_SUBMIT_FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleteSubmitting(true);
    setError("");

    try {
      const deletedCategoryId = await removeCategory(deleteTarget);
      setCategories((currentCategories) => currentCategories.filter((category) => category.id !== deletedCategoryId));
      setDeleteTarget(null);
    } catch {
      setError("Não foi possível excluir a categoria.");
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  return {
    categories,
    closeDeleteConfirm,
    closeForm,
    confirmDelete,
    currentPage,
    deleteTarget,
    error,
    formTarget,
    isDeleteSubmitting,
    isFormOpen,
    isLoading,
    isSubmitting,
    openCreateForm,
    openDeleteConfirm,
    openEditForm,
    paginatedCategories,
    setCurrentPage,
    submitCategory,
    totalPages,
  };
}