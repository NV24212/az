import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CacheBusterContext } from '../../context/CacheBusterContext';
import api, { classService } from '../../services/api';
import { Loader2, PlusCircle, MinusCircle, Search, ChevronDown } from 'lucide-react';
import Modal from '../../components/Modal';
import LoadingScreen from '../../components/LoadingScreen';
import PointsStudentCard from './PointsStudentCard';

const PointsManagement = () => {
  const { t } = useTranslation();
  const { bustCache } = useContext(CacheBusterContext);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState('add'); // 'add' or 'deduct'
  const [points, setPoints] = useState('');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/admin/students'),
        classService.getAllClasses(),
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes);
    } catch (err) {
      setError(t('pointsManagement.errors.fetchStudents'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(student => {
        if (!classFilter) return true;
        return student.class_id === parseInt(classFilter);
      });
  }, [students, searchTerm, classFilter]);

  const openModal = (student, type) => {
    setSelectedStudent(student);
    setActionType(type);
    setIsModalOpen(true);
    setPoints('');
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handlePointsSubmit = async (e) => {
    e.preventDefault();
    if (!points || !selectedStudent) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const pointsValue = actionType === 'deduct' ? -Math.abs(Number(points)) : Math.abs(Number(points));

    try {
      await api.post(`/admin/students/${selectedStudent.id}/add-points`, { points: pointsValue });
      const successMessage = actionType === 'add'
        ? t('pointsManagement.success.add', { points: pointsValue, studentName: selectedStudent.name })
        : t('pointsManagement.success.deduct', { points: Math.abs(pointsValue), studentName: selectedStudent.name });

      setSuccess(successMessage);

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === selectedStudent.id
            ? { ...student, points: student.points + pointsValue }
            : student
        )
      );

      bustCache();
      closeModal();
    } catch (err) {
      setError(t('pointsManagement.errors.addPoints'));
      console.error(err);
      fetchStudents(); // Re-fetch on error to ensure data consistency
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen fullScreen={false} />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">{t('pointsManagement.title')}</h1>
        <div className="flex items-center gap-4">
            <div className="relative">
                <label htmlFor="classFilter" className="sr-only">{t('userManagement.filterByClass')}</label>
                <select
                id="classFilter"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-white border border-brand-border text-brand-text p-3 pl-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 appearance-none"
                >
                <option value="">{t('userManagement.allClasses')}</option>
                {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2">
                    <ChevronDown className="h-5 w-5 text-brand-text-secondary" />
                </div>
            </div>
            <div className="relative w-full max-w-xs">
                <input
                    type="text"
                    placeholder={t('pointsManagement.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-brand-border text-brand-text p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-brand-text-secondary" />
                </div>
            </div>
        </div>
      </div>

      {error && !isModalOpen && <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg mb-6">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStudents.map((student) => (
          <PointsStudentCard
            key={student.id}
            student={student}
            onAdd={(s) => openModal(s, 'add')}
            onDeduct={(s) => openModal(s, 'deduct')}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${t(actionType === 'add' ? 'pointsManagement.add' : 'pointsManagement.deduct')} ${t('pointsManagement.titleFor')} ${selectedStudent?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePointsSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-brand-text-secondary mb-2">
              {t('pointsManagement.pointsTo', { context: actionType })}
            </label>
            <input
              type="number"
              id="points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeModal} className="bg-gray-100 hover:bg-gray-200 text-brand-text font-bold py-2.5 px-5 rounded-lg transition-colors">{t('common.cancel')}</button>
            <button
              type="submit"
              className={`font-bold py-2.5 px-5 rounded-lg transition-colors transform active:scale-95 flex items-center justify-center w-28 ${actionType === 'add' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : t('common.confirm')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default PointsManagement;
