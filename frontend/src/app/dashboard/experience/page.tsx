'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useConfirmModal, useToast } from '@/hooks/useModals';
import { apiClient, WorkExperience } from '@/lib/api/client';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';

export default function ExperiencePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
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
      await loadExperiences();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadExperiences = async () => {
    try {
      const response = await apiClient.getExperiences();
      setExperiences(response.experiences);
    } catch (error) {
      console.error('Failed to load experiences:', error);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      'Delete Experience',
      'Are you sure you want to delete this work experience? This action cannot be undone.',
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteExperience(id);
          await loadExperiences();
          showToast('Experience deleted successfully', 'success');
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Work Experience</h2>
            <p className="text-gray-400 mt-1">Manage your professional experience</p>
          </div>
          <button
            onClick={() => {
              setEditingExperience(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{exp.position.en}</h3>
                  <p className="text-md text-blue-400 mt-1">{exp.company.en}</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <p className="text-sm">{exp.location.en}</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{exp.description.en}</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'N/A'}</span>
                    </div>
                    {exp.current && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingExperience(exp);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No experiences found. Click &quot;Add Experience&quot; to create one.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ExperienceModal
          experience={editingExperience}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            await loadExperiences();
            setShowModal(false);
          }}
          showToast={showToast}
        />
      )}

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

function ExperienceModal({ experience, onClose, onSave, showToast }: any) {
  const [formData, setFormData] = useState({
    positionEn: experience?.position.en || '',
    positionFr: experience?.position.fr || '',
    companyEn: experience?.company.en || '',
    companyFr: experience?.company.fr || '',
    locationEn: experience?.location.en || '',
    locationFr: experience?.location.fr || '',
    descriptionEn: experience?.description.en || '',
    descriptionFr: experience?.description.fr || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    current: experience?.current || false,
    order: experience?.order || 0,
  });
  const [saving, setSaving] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const title = experience ? 'Update Experience' : 'Create Experience';
    const message = experience 
      ? 'Are you sure you want to update this work experience?' 
      : 'Are you sure you want to create this work experience?';

    showConfirm(
      title,
      message,
      async () => {
        setSaving(true);
        try {
          const data = {
            position: { en: formData.positionEn, fr: formData.positionFr },
            company: { en: formData.companyEn, fr: formData.companyFr },
            location: { en: formData.locationEn, fr: formData.locationFr },
            description: { en: formData.descriptionEn, fr: formData.descriptionFr },
            startDate: formData.startDate,
            endDate: formData.current ? null : formData.endDate || null,
            current: formData.current,
            order: formData.order,
          };

          if (experience) {
            await apiClient.updateExperience(experience.id, data);
            showToast('Experience updated successfully', 'success');
          } else {
            await apiClient.createExperience(data);
            showToast('Experience created successfully', 'success');
          }

          hideConfirm();
          onSave();
        } catch (error: any) {
          showToast(`Failed to save: ${error.message}`, 'error');
          setSaving(false);
          hideConfirm();
        }
      },
      experience ? 'info' : 'success'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-2xl my-8 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">
          {experience ? 'Edit Experience' : 'Create Experience'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Position (English) *
              </label>
              <input
                type="text"
                required
                value={formData.positionEn}
                onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Position (French) *
              </label>
              <input
                type="text"
                required
                value={formData.positionFr}
                onChange={(e) => setFormData({ ...formData, positionFr: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company (English) *
              </label>
              <input
                type="text"
                required
                value={formData.companyEn}
                onChange={(e) => setFormData({ ...formData, companyEn: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company (French) *
              </label>
              <input
                type="text"
                required
                value={formData.companyFr}
                onChange={(e) => setFormData({ ...formData, companyFr: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Location (English) *
              </label>
              <input
                type="text"
                required
                value={formData.locationEn}
                onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Location (French) *
              </label>
              <input
                type="text"
                required
                value={formData.locationFr}
                onChange={(e) => setFormData({ ...formData, locationFr: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (English) *
              </label>
              <textarea
                required
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (French) *
              </label>
              <textarea
                required
                value={formData.descriptionFr}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                disabled={formData.current}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-900 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="current"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
              className="rounded border-gray-800 bg-black text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="current" className="text-sm text-gray-300">
              I currently work here
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-800 text-gray-300 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              {saving ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </form>

        {/* Confirm Modal for Save */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={hideConfirm}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText={experience ? 'Update' : 'Create'}
          cancelText="Cancel"
          isLoading={saving}
        />
      </div>
    </div>
  );
}
