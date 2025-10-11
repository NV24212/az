import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, MinusCircle, Star, BookOpen } from 'lucide-react';

const PointsStudentCard = ({ student, onAdd, onDeduct }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div>
        <h3 className="text-lg font-bold text-brand-text min-w-0 break-words">{student.name}</h3>
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
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-border/50 pt-4">
        <button
          onClick={() => onAdd(student)}
          className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:text-green-700 transition-colors bg-green-500/10 hover:bg-green-500/20 rounded-lg py-2 text-sm font-semibold"
        >
          <PlusCircle size={18} />
          <span>{t('pointsManagement.add')}</span>
        </button>
        <button
          onClick={() => onDeduct(student)}
          className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 transition-colors bg-red-500/10 hover:bg-red-500/20 rounded-lg py-2 text-sm font-semibold"
        >
          <MinusCircle size={18} />
          <span>{t('pointsManagement.deduct')}</span>
        </button>
      </div>
    </div>
  );
};

export default PointsStudentCard;
