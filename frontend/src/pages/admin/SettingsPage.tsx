import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSettings, updateAdminSettings, StoreSettings } from '../../lib/api';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});

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

  if (isLoading) return <p>Loading settings...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Store Name</label>
            <input type="text" value={formData.storeName || ''} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Admin Email</label>
            <input type="email" value={formData.adminEmail || ''} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Store Description</label>
            <textarea value={formData.storeDescription || ''} onChange={e => setFormData({...formData, storeDescription: e.target.value})} className="w-full mt-1 p-2 border rounded-md" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input type="text" value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Delivery Fee</label>
            <input type="number" step="0.01" value={formData.deliveryFee || 0} onChange={e => setFormData({...formData, deliveryFee: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Free Delivery Minimum</label>
            <input type="number" step="0.01" value={formData.freeDeliveryMinimum || 0} onChange={e => setFormData({...formData, freeDeliveryMinimum: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-md"/>
          </div>
           <div className="flex items-center">
            <input type="checkbox" checked={formData.codEnabled || false} onChange={e => setFormData({...formData, codEnabled: e.target.checked})} className="h-4 w-4 rounded"/>
            <label className="ml-2 block text-sm">Cash on Delivery Enabled</label>
          </div>
        </div>
        <div className="pt-4">
          <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
