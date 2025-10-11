import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Star, BookOpen } from 'lucide-react';

const StudentCard = ({ student, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-brand-text flex-1 min-w-0 break-words">{student.name}</h3>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => onEdit(student)} className="text-brand-text-secondary hover:text-brand-primary transition-colors">
              <Edit size={18} />
            </button>
            <button onClick={() => onDelete(student.id)} className="text-brand-text-secondary hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-brand-text-secondary">
            <BookOpen size={14} />
            <span>{student.class?.name || <span className="italic">{t('studentManagement.form.unassigned')}</span>}</span>
          </div>
          <div className="flex items-center gap-2 text-brand-text-secondary">
            <Star size={14} />
            <span>{t('studentManagement.table.points')}: {student.points}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
