import ProductCard from '../components/ProductCard';

const products = [
  {
    name: 'Elegant Summer Dress',
    description: 'Short product description.',
    price: '$79.99',
    image: '',
  },
  {
    name: 'Casual Denim Jacket',
    description: 'Short product description.',
    price: '$59.99',
    image: '',
  },
  {
    name: 'Leather Ankle Boots',
    description: 'Short product description.',
    price: '$129.99',
    image: '',
  },
  {
    name: 'Stylish Sunglasses',
    description: 'Short product description.',
    price: '$39.99',
    image: '',
  },
  {
    name: 'Classic White Sneakers',
    description: 'Short product description.',
    price: '$89.99',
    image: '',
  },
  {
    name: 'Boho Chic Handbag',
    description: 'Short product description.',
    price: '$69.99',
    image: '',
  },
  {
    name: 'Cozy Knit Sweater',
    description: 'Short product description.',
    price: '$69.99',
    image: '',
  },
  {
    name: 'Statement Necklace',
    description: 'Short product description.',
    price: '$29.99',
    image: '',
  },
];

export default function Store() {
  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white">All Products</button>
          <button className="px-4 py-2 text-sm font-medium rounded-full bg-white text-slate-700 hover:bg-slate-100">Electronics</button>
          <button className="px-4 py-2 text-sm font-medium rounded-full bg-white text-slate-700 hover:bg-slate-100">Accessories</button>
          <button className="px-4 py-2 text-sm font-medium rounded-full bg-white text-slate-700 hover:bg-slate-100">Home & Office</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </div>
  );
}