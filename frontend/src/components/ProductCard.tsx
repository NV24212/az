import { Plus } from 'lucide-react';
import type { Product } from '../lib/api';
import { useCartStore } from '../lib/cartStore';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm">No image uploaded</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-gray-800">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white transition-colors hover:bg-brand/90"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}