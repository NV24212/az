import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import type { Product, Category } from '../lib/api';
import { useCartStore } from '../lib/cartStore';

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <img
        src={product.imageUrl || 'https://placehold.co/600x400'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-slate-500 text-sm mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-purple-600">${product.price.toFixed(2)}</span>
          <button
            onClick={() => addItem(product)}
            className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome to AzharStore</h1>
        <p className="text-slate-600 mt-1">Browse our collection of fine products.</p>
      </div>

      <div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedCategory ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            All
          </button>
          {categories?.map(cat => (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategory(cat.categoryId)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === cat.categoryId ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {(isLoadingProducts || isLoadingCategories) && <p>Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts?.map(product => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  )
}


