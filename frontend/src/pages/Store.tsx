import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/ui/Loading';

type Product = {
  productId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

export default function Store() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/api/products');
      return res.data;
    },
  });

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-sm">
          <button className="px-5 py-2 text-sm font-semibold rounded-full brand-bg text-white">All Products</button>
          <button className="px-5 py-2 text-sm font-medium rounded-full text-slate-600 hover:bg-slate-100 transition-colors">Electronics</button>
          <button className="px-5 py-2 text-sm font-medium rounded-full text-slate-600 hover:bg-slate-100 transition-colors">Accessories</button>
          <button className="px-5 py-2 text-sm font-medium rounded-full text-slate-600 hover:bg-slate-100 transition-colors">Home & Office</button>
        </div>
      </div>
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products?.map((product) => (
            <ProductCard key={product.productId} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}