import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api, { weekService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, UploadCloud, Loader2, Video, FileCheck, Trash } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import Modal from '../../components/Modal';
import WeekCard from './WeekCard';
import ConfirmationModal from '../../components/ConfirmationModal';

const WeekManagement = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingWeekId, setDeletingWeekId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [removeVideo, setRemoveVideo] = useState(false);

  const initialFormState = {
    week_number: '',
    title: '',
    is_locked: true,
    content_cards: [{ title: '', description: '' }],
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchWeeks = useCallback(async (isInitialLoad = false) => {
    if (!token) return;
    if (isInitialLoad) setLoading(true);
    try {
      const response = await api.get('/weeks/all');
      setWeeks(response.data.sort((a, b) => a.week_number - b.week_number));
      setError('');
    } catch (err)      setError(t('weekManagement.errors.fetch'));
      console.error(err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    fetchWeeks(true);
  }, [fetchWeeks]);

  const openModal = (week = null) => {
    setEditingWeek(week);
    setVideoFile(null);
    setSubmissionStatus('');
    setUploadProgress(0);
    setRemoveVideo(false);
    setVideoPreview(null);

    if (week) {
      const cards = week.content_cards?.length > 0 ? week.content_cards : [{ title: '', description: '' }];
      setFormData({ ...week, content_cards: cards });
      if (week.video_url) {
        setVideoPreview(week.video_url);
      }
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWeek(null);
    setVideoFile(null);
    setSubmissionStatus('');
    setUploadProgress(0);
    setVideoPreview(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'is_locked') {
      setFormData({ ...formData, is_locked: !checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleVideoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setVideoPreview(URL.createObjectURL(e.target.files[0]));
      setRemoveVideo(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setRemoveVideo(true);
  };

  const handleCardChange = (index, e) => {
    const newCards = formData.content_cards.map((card, i) =>
      i === index ? { ...card, [e.target.name]: e.target.value } : card
    );
    setFormData({ ...formData, content_cards: newCards });
  };

  const addCard = () => {
    setFormData({ ...formData, content_cards: [...formData.content_cards, { title: '', description: '' }] });
  };

  const removeCard = (index) => {
    const newCards = formData.content_cards.filter((_, i) => i !== index);
    setFormData({ ...formData, content_cards: newCards });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errorKey = editingWeek ? 'weekManagement.errors.update' : 'weekManagement.errors.add';

    try {
      // Step 1: Create or Update week details
      setSubmissionStatus(t(editingWeek ? 'weekManagement.status.updatingWeek' : 'weekManagement.status.creatingWeek'));
      const weekPayload = {
        title: formData.title,
        week_number: formData.week_number,
        is_locked: formData.is_locked,
      };

      let weekResponse;
      if (editingWeek) {
        weekResponse = await api.put(`/admin/weeks/${editingWeek.id}`, weekPayload);
      } else {
        weekResponse = await api.post('/admin/weeks', weekPayload);
      }
      const weekId = weekResponse.data.id;

      // Step 2: Upload video if a new one is provided
      if (videoFile) {
        setSubmissionStatus(t('weekManagement.status.uploadingVideo'));
        await weekService.uploadWeekVideo(weekId, videoFile, setUploadProgress);
      } else if (removeVideo && editingWeek) {
        setSubmissionStatus(t('weekManagement.status.removingVideo'));
        await api.delete(`/admin/weeks/${weekId}/video`);
      }

      // Step 3: Update content cards
      setSubmissionStatus(t('weekManagement.status.savingCards'));
      if (editingWeek) {
        for (const card of editingWeek.content_cards) {
          if (card.id) {
            await api.delete(`/admin/weeks/cards/${card.id}`);
          }
        }
      }
      for (const card of formData.content_cards) {
        if (card.title && card.description) {
          await api.post(`/admin/weeks/${weekId}/cards`, card);
        }
      }

      setSubmissionStatus(t('weekManagement.status.completed'));
      await fetchWeeks();
      setTimeout(() => {
        closeModal();
        setIsSubmitting(false);
      }, 1000);

    } catch (err) {
      setError(t(errorKey));
      console.error(err);
      setSubmissionStatus('');
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setDeletingWeekId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingWeekId) return;
    setIsConfirmModalOpen(false);
    setWeeks(prevWeeks => prevWeeks.map(w => w.id === deletingWeekId ? { ...w, deleting: true } : w));
    setTimeout(async () => {
      try {
        await api.delete(`/admin/weeks/${deletingWeekId}`);
        setWeeks(prevWeeks => prevWeeks.filter(w => w.id !== deletingWeekId));
      } catch (err) {
        setError(t('weekManagement.errors.delete'));
        console.error(err);
        fetchWeeks();
      } finally {
        setDeletingWeekId(null);
      }
    }, 300);
  };

  const renderAddEditForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="week_number" className="block text-sm font-bold text-brand-text-secondary mb-2">{t('weekManagement.form.weekNumber')}</label>
          <input type="number" id="week_number" name="week_number" value={formData.week_number} onChange={handleFormChange} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-brand-text-secondary mb-2">{t('weekManagement.form.title')}</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} required className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
        </div>
      </div>
      <div className="pt-2">
        <label className="flex items-center gap-3 text-brand-text cursor-pointer">
          <input type="checkbox" name="is_locked" checked={!formData.is_locked} onChange={handleFormChange} className="form-checkbox h-5 w-5 bg-white border-brand-border rounded text-brand-primary focus:ring-brand-primary/50" />
          <span className="font-medium">{t('weekManagement.form.unlocked')}</span>
        </label>
      </div>

      {/* Video Upload Section */}
      <div className="border-t border-brand-border pt-6">
        <h3 className="text-lg font-bold mb-4 text-brand-text">{t('weekManagement.form.video')}</h3>
        {videoPreview ? (
          <div className="relative group">
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-4">
              <Video className="w-10 h-10 text-brand-primary"/>
              <div className="flex-grow">
                <p className="text-brand-text font-medium truncate">{videoFile ? videoFile.name : t('weekManagement.form.currentVideo')}</p>
                <a href={videoPreview} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-text-secondary hover:underline">{t('weekManagement.form.preview')}</a>
              </div>
            </div>
            <button type="button" onClick={handleRemoveVideo} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash size={16}/>
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" className="mt-1 flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-brand-border border-dashed rounded-lg cursor-pointer hover:border-brand-primary/50 transition-colors">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-brand-text-secondary" />
              <p className="text-sm text-brand-text-secondary">{t('weekManagement.form.uploadHint')}</p>
            </div>
            <input id="file-upload" name="video_file" type="file" className="sr-only" onChange={handleVideoFileChange} accept="video/*" />
          </label>
        )}
      </div>

      {/* Content Cards Section */}
      <div className="border-t border-brand-border pt-6">
        <h3 className="text-lg font-bold mb-4 text-brand-text">{t('weekManagement.form.contentCards')}</h3>
        <div className="space-y-4">
          {formData.content_cards.map((card, index) => (
            <div key={index} className="bg-gray-50 border border-brand-border/50 p-4 rounded-lg space-y-3 relative">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-brand-text-secondary">{t('weekManagement.form.cardTitle')}</label>
                <button type="button" onClick={() => removeCard(index)} className="text-brand-text-secondary hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>
              <input type="text" name="title" value={card.title} onChange={(e) => handleCardChange(index, e)} required className="w-full bg-white border border-brand-border p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary/50" />
              <label className="text-sm font-bold text-brand-text-secondary mt-2 block">{t('weekManagement.form.cardDescription')}</label>
              <textarea name="description" value={card.description} onChange={(e) => handleCardChange(index, e)} required className="w-full bg-white border border-brand-border p-2.5 rounded-md" rows="2"></textarea>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCard} className="mt-4 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-brand-text font-semibold py-2 px-4 rounded-lg text-sm transition-colors transform active:scale-95">
          <Plus size={16}/> {t('weekManagement.form.addCard')}
        </button>
      </div>

      {/* Submission Controls */}
      <div className="flex justify-end gap-4 pt-4 border-t border-brand-border">
        {!isSubmitting && <button type="button" onClick={closeModal} className="bg-gray-100 hover:bg-gray-200 text-brand-text font-bold py-2.5 px-5 rounded-lg transition-colors">{t('common.cancel')}</button>}
        <button
          type="submit"
          className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors transform active:scale-95 flex items-center justify-center min-w-[120px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              {submissionStatus === t('weekManagement.status.completed') ? <FileCheck className="mr-2"/> : <Loader2 className="animate-spin mr-2" />}
              <span>{submissionStatus}</span>
            </div>
          ) : (
            <span>{editingWeek ? t('common.saveChanges') : t('common.create')}</span>
          )}
        </button>
      </div>
       {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-brand-border/20 rounded-full h-2.5 mt-4">
            <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
    </form>
  );

  if (loading) return <LoadingScreen fullScreen={false} />;
  if (error) return <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">{t('weekManagement.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('weekManagement.addWeek')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weeks.map((week) => (
          <WeekCard
            key={week.id}
            week={week}
            onEdit={openModal}
            onDelete={openDeleteConfirm}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingWeek ? t('weekManagement.editWeek') : t('weekManagement.addWeek')}
      >
        {renderAddEditForm()}
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('common.delete')}
        message={t('weekManagement.confirmDelete')}
      />
    </>
  );
};

export default WeekManagement;
