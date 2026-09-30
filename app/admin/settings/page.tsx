'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    store_name: '',
    store_phone: '',
    store_email: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*');
      const settings: any = {};
      data?.forEach((item: any) => {
        settings[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      });
      setFormData({
        store_name: settings.store_name || '',
        store_phone: settings.store_phone || '',
        store_email: settings.store_email || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates = [
        { key: 'store_name', value: JSON.stringify(formData.store_name) },
        { key: 'store_phone', value: JSON.stringify(formData.store_phone) },
        { key: 'store_email', value: JSON.stringify(formData.store_email) },
      ];

      for (const update of updates) {
        await supabase
          .from('settings')
          .update({ value: update.value })
          .eq('key', update.key);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إعدادات المتجر</h1>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow max-w-lg">
        <div className="mb-4">
          <label className="block text-right mb-2">اسم المتجر</label>
          <input
            type="text"
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right mb-2">رقم WhatsApp</label>
          <input
            type="text"
            value={formData.store_phone}
            onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
            placeholder="مثل: 218912345678"
          />
        </div>

        <div className="mb-6">
          <label className="block text-right mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            value={formData.store_email}
            onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          حفظ الإعدادات
        </button>
      </form>
    </div>
  );
}