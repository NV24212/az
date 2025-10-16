import { useQuery } from "@tanstack/react-query";

const fetchCategories = async () => {
  // Replace with your actual API endpoint
  const res = await fetch("https://api.azhar.store/api/categories");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const CategoriesPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((category) => (
            <tr key={category.categoryId}>
              <td className="border px-4 py-2">{category.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesPage;
