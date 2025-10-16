import { useQuery } from '@tanstack/react-query';

const fetchProducts = async () => {
  // Replace with your actual API endpoint
  const res = await fetch('https://api.azhar.store/api/products');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

const ProductsPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Description</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.productId}>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.description}</td>
              <td className="border px-4 py-2">{product.price}</td>
              <td className="border px-4 py-2">{product.stockQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;