import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSettings, updateAdminSettings } from '../../lib/api';
import type { StoreSettings } from '@/types';
import { Loader2 } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const SettingsCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-brand-border shadow-card">
    <div className="p-6 border-b border-brand-border">
      <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const TextInput = ({ label, id, ...props }: { label: string; id: string; [key: string]: any }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-2">{label}</label>
    <input id={id} {...props} className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" />
  </div>
);

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});

  const { data: settings, isPending } = useQuery({
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
      // In a real app, you'd use a toast notification here
      alert('Settings updated successfully!');
    },
    onError: (error) => {
      alert(`Failed to update settings: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isPending) return <LoadingScreen />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Settings</h1>

      <SettingsCard title="General Settings">
        <div className="space-y-4">
          <TextInput label="Store Name" id="storeName" value={formData.storeName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, storeName: e.target.value})} />
          <TextInput label="Currency" id="currency" value={formData.currency || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, currency: e.target.value})} />
           <div>
            <label htmlFor="storeDescription" className="block text-sm font-medium text-brand-text-secondary mb-2">Store Description</label>
            <textarea id="storeDescription" value={formData.storeDescription || ''} onChange={(e) => setFormData({...formData, storeDescription: e.target.value})} className="w-full bg-white border border-brand-border text-brand-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50" rows={3}></textarea>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Admin Account">
         <div className="space-y-4">
          <TextInput label="Admin Email" id="adminEmail" type="email" value={formData.adminEmail || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, adminEmail: e.target.value})} />
          <TextInput label="New Password" id="newPassword" type="password" placeholder="Leave blank to keep current password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value } as any)} />
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center w-36"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default SettingsPage;
