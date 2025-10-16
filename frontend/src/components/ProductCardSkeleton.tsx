export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="h-56 bg-slate-100" />
      <div className="p-5">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-full mb-4" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-9 w-9 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}