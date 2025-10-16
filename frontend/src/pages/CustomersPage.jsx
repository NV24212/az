import { useQuery } from "@tanstack/react-query";

const fetchCustomers = async () => {
  // Replace with your actual API endpoint
  const res = await fetch("https://api.azhar.store/api/admin/customers");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const CustomersPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Phone</th>
            <th className="py-2">Address</th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer) => (
            <tr key={customer.customerId}>
              <td className="border px-4 py-2">{customer.name}</td>
              <td className="border px-4 py-2">{customer.phone}</td>
              <td className="border px-4 py-2">{customer.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersPage;
