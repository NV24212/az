import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export default function ProductCard({ name, description, price, imageUrl }: ProductCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm overflow-hidden group"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-56 bg-slate-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-slate-500 text-sm">No image uploaded</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-md font-semibold text-slate-800 truncate">{name}</h3>
        <p className="text-sm text-slate-500 mt-1 h-10">{description || 'No description available.'}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold brand-text">${price.toFixed(2)}</span>
          <button className="brand-bg text-white rounded-full w-9 h-9 flex items-center justify-center hover:opacity-90 transition-opacity">
            <Plus size={22} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}