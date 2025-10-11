import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StoreSettings } from '../../lib/api';
import { getAdminSettings, updateAdminSettings } from '../../lib/api';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: getAdminSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (updatedSettings: Partial<StoreSettings>) => updateAdminSettings(updatedSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      setPassword('');
      setConfirmPassword('');
      setNotification({ type: 'success', message: t('settingsPage.notifications.success') });
    },
    onError: (error) => {
      setNotification({ type: 'error', message: `${t('settingsPage.notifications.error')}: ${error.message}` });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    if (password && password !== confirmPassword) {
      setNotification({ type: 'error', message: t('settingsPage.notifications.passwordMismatch') });
      return;
    }

    const settingsToUpdate: Partial<StoreSettings & { password?: string }> = { ...formData };
    if (password) {
      settingsToUpdate.password = password;
    }

    mutation.mutate(settingsToUpdate);
  };

  if (isLoading) return <LoadingScreen fullScreen={false} />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-primary mb-8">{t('settingsPage.title')}</h1>
      <motion.form
        onSubmit={handleSubmit}
        className="bg-black/20 border border-brand-border rounded-20 p-8 space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.storeName')}</label>
            <input type="text" value={formData.storeName || ''} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.adminEmail')}</label>
            <input type="email" value={formData.adminEmail || ''} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.newPassword')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary" placeholder={t('settingsPage.passwordPlaceholder')}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.confirmPassword')}</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.storeDescription')}</label>
            <textarea value={formData.storeDescription || ''} onChange={e => setFormData({...formData, storeDescription: e.target.value})} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.currency')}</label>
            <input type="text" value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.deliveryFee')}</label>
            <input type="number" step="0.01" value={formData.deliveryFee || 0} onChange={e => setFormData({...formData, deliveryFee: Number(e.target.value)})} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-secondary">{t('settingsPage.freeDeliveryMinimum')}</label>
            <input type="number" step="0.01" value={formData.freeDeliveryMinimum || 0} onChange={e => setFormData({...formData, freeDeliveryMinimum: Number(e.target.value)})} className="w-full mt-1 p-2 bg-black/30 border border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary"/>
          </div>
           <div className="flex items-center">
            <input type="checkbox" checked={formData.codEnabled || false} onChange={e => setFormData({...formData, codEnabled: e.target.checked})} className="h-4 w-4 rounded bg-black/30 border-brand-border text-brand-primary focus:ring-brand-primary"/>
            <label className="ml-2 block text-sm text-brand-secondary">{t('settingsPage.codEnabled')}</label>
          </div>
        </div>

        {notification && (
          <div className={`p-4 rounded-lg text-sm ${notification.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {notification.message}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-brand-primary text-brand-background font-bold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors transform active:scale-95 flex items-center justify-center w-40" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.saveChanges')}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
