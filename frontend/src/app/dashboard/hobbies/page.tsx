'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useConfirmModal, useToast } from '@/hooks/useModals';
import { apiClient, Hobby } from '@/lib/api/client';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function HobbiesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();
  const { toast, showToast, hideToast } = useToast();
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
    showConfirm(
      'Delete Hobby',
      'Are you sure you want to delete this hobby? This action cannot be undone.',
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteHobby(id);
          await loadHobbies();
          showToast('Hobby deleted successfully', 'success');
        } catch (error: any) {
          showToast(`Failed to delete: ${error.message}`, 'error');
        } finally {
          setIsDeleting(false);
          hideConfirm();
        }
      },
      'danger'
    );
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-white">Loading...</div></div>;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Hobbies & Interests</h2>
            <p className="text-gray-400 mt-1">Showcase your personal interests</p>
          </div>
          <button onClick={() => { setEditingHobby(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50">
            <Plus className="w-4 h-4" />
            Add Hobby
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hobbies.map((hobby) => (
            <div key={hobby.id} className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg p-6" style={{ borderLeft: `4px solid ${hobby.color || '#3B82F6'}` }}>
              <h3 className="text-lg font-semibold mb-2 text-white">{hobby.title.en}</h3>
              {hobby.description && <p className="text-sm text-gray-300 mb-3">{hobby.description.en}</p>}
              {hobby.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hobby.imageUrl} alt={hobby.title.en} className="w-full h-32 object-cover rounded mb-3 border border-gray-800" />
              )}
              <div className="flex gap-2">
                <button onClick={() => { setEditingHobby(hobby); setShowModal(true); }} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button onClick={() => handleDelete(hobby.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition-colors">
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {hobbies.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500">No hobbies found.</div>}
        </div>
      </div>

      {showModal && <HobbyModal hobby={editingHobby} onClose={() => setShowModal(false)} onSave={async () => { await loadHobbies(); setShowModal(false); }} showToast={showToast} />}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={hideConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={hideToast}
        message={toast.message}
        type={toast.type}
      />
    </DashboardLayout>
  );
}

function HobbyModal({ hobby, onClose, onSave, showToast }: any) {
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
      showToast(`Failed to save: ${error.message}`, 'error');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">{hobby ? 'Edit Hobby' : 'Create Hobby'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Title (English) *</label>
              <input type="text" required value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Title (French) *</label>
              <input type="text" required value={formData.titleFr} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Description (English)</label>
              <textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Description (French)</label>
              <textarea value={formData.descriptionFr} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
              <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
              <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#3B82F6" className="w-full px-3 py-2 bg-black border border-gray-800 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2 border border-gray-800 text-gray-300 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
