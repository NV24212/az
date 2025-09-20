export default function CategoryTableSkeleton() {
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-2">
        <div className="h-4 bg-slate-200 rounded"></div>
      </td>
      <td className="p-2">
        <div className="h-4 bg-slate-200 rounded"></div>
      </td>
      <td className="p-2">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </td>
    </tr>
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            <th scope="col" className="p-2">Category ID</th>
            <th scope="col" className="p-2">Name</th>
            <th scope="col" className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </tbody>
      </table>
    </div>
  );
}
