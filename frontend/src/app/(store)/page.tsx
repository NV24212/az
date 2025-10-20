'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Loading from '@/components/ui/Loading';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import QueryProvider from '@/components/QueryProvider';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name:string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: Category;
};

function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/products?categoryId=${selectedCategory}`
        : "/api/products";
      const res = await api.get(url);
      return res.data;
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/api/categories');
      return res.data;
    },
  });

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-sm">
          <button onClick={() => setSelectedCategory(null)} className={`px-5 py-2 text-sm font-semibold rounded-full ${!selectedCategory ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100 transition-colors'}`}>All Products</button>
          {isLoadingCategories ? (
            <div className="flex items-center justify-center px-5">
              <Loading />
            </div>
          ) : (
            categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 text-sm font-medium rounded-full ${
                  selectedCategory === category.id
                    ? "bg-brand text-white"
                    : "text-gray-600 hover:bg-gray-100 transition-colors"
                }`}
              >
                {category.name}
              </button>
            ))
          )}
        </div>
      </div>
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products?.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Store() {
    return (
        <QueryProvider>
            <StorePage />
        </QueryProvider>
    )
}
