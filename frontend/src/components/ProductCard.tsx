import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description: string;
  price: string;
  image: string;
}

export default function ProductCard({ name, description, price, image }: ProductCardProps) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-48 bg-slate-200 flex items-center justify-center">
        <span className="text-slate-500">No image uploaded</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold brand-text">{price}</span>
          <button className="bg-slate-900 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-700 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}