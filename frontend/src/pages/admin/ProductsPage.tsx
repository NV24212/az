import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product, Category } from '@/types';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
} from '../../lib/api';
import Modal from '../../components/Modal';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

type ProductData = Omit<Product, 'productId'>;

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
}

const ProductForm = ({ product, categories, onSuccess, onClose }: ProductFormProps) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stockQuantity || 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ProductData) =>
      product ? updateProduct(product.productId, data) : createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: ProductData = { name, description, price, stockQuantity: stock, categoryId: Number(categoryId), imageUrl };
    mutation.mutate(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields for product details */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-2">Product Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-2">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-brand-text-secondary mb-2">Price</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-brand-text-secondary mb-2">Stock</label>
          <input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-brand-text-secondary mb-2">Category</label>
        <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
          <option value="">Select a category</option>
          {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-text-secondary mb-2">Image URL</label>
        <input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-brand-text font-bold py-2.5 px-5 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center w-32">
          {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

const ProductsPage = () => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isPending, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getAdminProducts,
  });

  const { data: categories, isPending: categoriesLoading } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getAdminCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isPending || categoriesLoading) return <LoadingScreen />;
  if (error) return <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Products</h1>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          product={selectedProduct}
          categories={categories || []}
          onSuccess={() => setFormOpen(false)}
          onClose={() => setFormOpen(false)}
        />
      </Modal>

      <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="bg-gray-50 border-b border-brand-border">
            <tr>
              <th scope="col" className="p-4">Product Name</th>
              <th scope="col" className="p-4">Price</th>
              <th scope="col" className="p-4">Stock</th>
              <th scope="col" className="p-4">Category</th>
              <th scope="col" className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.productId} className="border-b border-brand-border last:border-b-0">
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4">${product.price.toFixed(2)}</td>
                <td className="p-4">{product.stockQuantity}</td>
                <td className="p-4">{categories?.find(c => c.categoryId === product.categoryId)?.name || 'N/A'}</td>
                <td className="p-4 flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setFormOpen(true);
                    }}
                    className="text-brand-primary hover:underline"
                  >
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.productId)} className="text-red-600 hover:underline">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsPage;
