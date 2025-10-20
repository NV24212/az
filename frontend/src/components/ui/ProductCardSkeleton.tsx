const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-gray-200 rounded-full w-9 h-9"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
