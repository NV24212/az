import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full">
      <motion.div
        className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </div>
  );
}