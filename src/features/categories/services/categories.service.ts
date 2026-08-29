import type {
  Category,
  CategoryDeleteTarget,
  CategoryFormData,
  CategoryFormTarget,
} from "../models/categories.models";
import { categoriesRepository } from "../repository/categories.repository";
import { toCategoryModel, toCategoryRequestDto } from "../repository/mapper/category.mapper";

export async function fetchCategories(): Promise<Category[]> {
  const categories = await categoriesRepository.listCategories();
  return categories.map(toCategoryModel);
}

export async function createCategory(formData: CategoryFormData): Promise<Category> {
  const category = await categoriesRepository.createCategory(toCategoryRequestDto(formData.nome));
  return toCategoryModel(category);
}

export async function updateCategory(target: CategoryFormTarget, formData: CategoryFormData): Promise<Category> {
  const category = await categoriesRepository.updateCategory(target.id, toCategoryRequestDto(formData.nome));
  return toCategoryModel(category);
}

export async function removeCategory(target: CategoryDeleteTarget): Promise<number> {
  await categoriesRepository.deleteCategory(target.id);
  return target.id;
}