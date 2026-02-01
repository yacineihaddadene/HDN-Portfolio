'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Hobby } from '@/lib/api/client';

export default function HobbiesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }
      setUser(session.data.user);
      await loadHobbies();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadHobbies = async () => {
    try {
      const response = await apiClient.getHobbies();
      setHobbies(response.hobbies);
    } catch (error) {
      console.error('Failed to load hobbies:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hobby?')) return;
    try {
      await apiClient.deleteHobby(id);
      await loadHobbies();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div>Loading...</div></div>;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Hobbies & Interests</h2>
            <p className="text-gray-600 mt-1">Showcase your personal interests</p>
          </div>
          <button onClick={() => { setEditingHobby(null); setShowModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">➕ Add Hobby</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hobbies.map((hobby) => (
            <div key={hobby.id} className="bg-white rounded-lg shadow p-6" style={{ borderLeft: `4px solid ${hobby.color || '#3B82F6'}` }}>
              <h3 className="text-lg font-semibold mb-2">{hobby.title.en}</h3>
              {hobby.description && <p className="text-sm text-gray-600 mb-3">{hobby.description.en}</p>}
              {hobby.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hobby.imageUrl} alt={hobby.title.en} className="w-full h-32 object-cover rounded mb-3" />
              )}
              <div className="flex gap-2">
                <button onClick={() => { setEditingHobby(hobby); setShowModal(true); }} className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                <button onClick={() => handleDelete(hobby.id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          ))}
          {hobbies.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500">No hobbies found.</div>}
        </div>
      </div>

      {showModal && <HobbyModal hobby={editingHobby} onClose={() => setShowModal(false)} onSave={async () => { await loadHobbies(); setShowModal(false); }} />}
    </DashboardLayout>
  );
}

function HobbyModal({ hobby, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    titleEn: hobby?.title.en || '', titleFr: hobby?.title.fr || '',
    descriptionEn: hobby?.description?.en || '', descriptionFr: hobby?.description?.fr || '',
    imageUrl: hobby?.imageUrl || '', color: hobby?.color || '#3B82F6',
    order: hobby?.order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        title: { en: formData.titleEn, fr: formData.titleFr },
        order: formData.order,
      };
      if (formData.descriptionEn || formData.descriptionFr) {
        data.description = { en: formData.descriptionEn, fr: formData.descriptionFr };
      }
      if (formData.imageUrl) data.imageUrl = formData.imageUrl;
      if (formData.color) data.color = formData.color;

      if (hobby) await apiClient.updateHobby(hobby.id, data);
      else await apiClient.createHobby(data);
      onSave();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4">{hobby ? 'Edit Hobby' : 'Create Hobby'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Title (English) *</label>
              <input type="text" required value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Title (French) *</label>
              <input type="text" required value={formData.titleFr} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Description (English)</label>
              <textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Description (French)</label>
              <textarea value={formData.descriptionFr} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Image URL</label>
              <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Color</label>
              <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#3B82F6" className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
