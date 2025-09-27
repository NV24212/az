import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import type { Product, Category } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function Storefront() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet<Product[]>('/api/products'),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/api/categories'),
  });

  const filteredProducts = selectedCategory
    ? products?.filter(p => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="space-y-8">
      <div className="mb-12 flex justify-center gap-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className={
            !selectedCategory
              ? "rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm"
              : "rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          }
          aria-pressed={!selectedCategory}
        >
          All Products
        </button>
        {categories?.map(cat => (
          <button
            key={cat.categoryId}
            onClick={() => setSelectedCategory(cat.categoryId)}
            className={
              selectedCategory === cat.categoryId
                ? "rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm"
                : "rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            }
            aria-pressed={selectedCategory === cat.categoryId}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {(isLoadingProducts || isLoadingCategories) && <p>Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts?.map(product => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  )
}


