export function categoriesForType(categories, type) {
  const normalizedType = String(type ?? '').toUpperCase();

  if (Array.isArray(categories)) {
    return categories.filter(category => !category.type || category.type === normalizedType);
  }

  if (normalizedType === 'INCOME') {
    return categories?.income ?? [];
  }

  return categories?.expense ?? [];
}
