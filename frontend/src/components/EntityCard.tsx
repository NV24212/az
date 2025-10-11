import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface EntityCardProps {
  title: string;
  children?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

const EntityCard: React.FC<EntityCardProps> = ({ title, children, onEdit, onDelete }) => {
  return (
    <div className="bg-black/20 border border-brand-border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:border-brand-primary/50 hover:-translate-y-1">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-brand-primary flex-1 min-w-0 break-words">{title}</h3>
          <div className="flex items-center gap-3 flex-shrink-0">
            {onEdit && (
              <button onClick={onEdit} className="text-brand-secondary hover:text-brand-primary transition-colors">
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-brand-secondary hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 space-y-2 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EntityCard;
