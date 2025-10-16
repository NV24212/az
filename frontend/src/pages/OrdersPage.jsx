import { useQuery } from "@tanstack/react-query";

const fetchOrders = async () => {
  // Replace with your actual API endpoint
  const res = await fetch("https://api.azhar.store/api/admin/orders");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const OrdersPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Order ID</th>
            <th className="py-2">Customer ID</th>
            <th className="py-2">Status</th>
            <th className="py-2">Total Amount</th>
            <th className="py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order.orderId}>
              <td className="border px-4 py-2">{order.orderId}</td>
              <td className="border px-4 py-2">{order.customerId}</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">{order.totalAmount}</td>
              <td className="border px-4 py-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
