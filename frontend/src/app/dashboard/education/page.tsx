'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useConfirmModal, useToast } from '@/hooks/useModals';
import { apiClient, Education } from '@/lib/api/client';
import { Plus, Edit2, Trash2, Calendar, MapPin, Award } from 'lucide-react';

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [education, setEducation] = useState<Education[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
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
      await loadEducation();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadEducation = async () => {
    try {
      const response = await apiClient.getEducation();
      setEducation(response.education);
    } catch (error) {
      console.error('Failed to load education:', error);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      'Delete Education',
      'Are you sure you want to delete this education entry? This action cannot be undone.',
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteEducation(id);
          await loadEducation();
          showToast('Education deleted successfully', 'success');
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
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-lg text-white">Loading...</div></div>;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Education</h2>
            <p className="text-gray-400 mt-1">Manage your educational background</p>
          </div>
          <button
            onClick={() => { setEditingEducation(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>

        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{edu.degree.en}</h3>
                  <p className="text-md text-blue-400 mt-1">{edu.institution.en}</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <p className="text-sm">{edu.location.en}</p>
                  </div>
                  {edu.description && <p className="text-sm text-gray-300 mt-2">{edu.description.en}</p>}
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{edu.startDate} - {edu.endDate || 'Present'}</span>
                    </div>
                    {edu.gpa && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>GPA: {edu.gpa}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEducation(edu); setShowModal(true); }} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(edu.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {education.length === 0 && <div className="text-center py-12 text-gray-500">No education entries found.</div>}
        </div>
      </div>

      {showModal && (
        <EducationModal 
          education={editingEducation} 
          onClose={() => setShowModal(false)} 
          onSave={async () => { await loadEducation(); setShowModal(false); }} 
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

function EducationModal({ education, onClose, onSave, showToast }: any) {
  const [formData, setFormData] = useState({
    degreeEn: education?.degree.en || '', degreeFr: education?.degree.fr || '',
    institutionEn: education?.institution.en || '', institutionFr: education?.institution.fr || '',
    locationEn: education?.location.en || '', locationFr: education?.location.fr || '',
    descriptionEn: education?.description?.en || '', descriptionFr: education?.description?.fr || '',
    startDate: education?.startDate || '', endDate: education?.endDate || '',
    gpa: education?.gpa || '', order: education?.order || 0,
  });
  const [saving, setSaving] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const title = education ? 'Update Education' : 'Create Education';
    const message = education 
      ? 'Are you sure you want to update this education entry?' 
      : 'Are you sure you want to create this education entry?';

    showConfirm(
      title,
      message,
      async () => {
        setSaving(true);
        try {
          const data: any = {
            degree: { en: formData.degreeEn, fr: formData.degreeFr },
            institution: { en: formData.institutionEn, fr: formData.institutionFr },
            location: { en: formData.locationEn, fr: formData.locationFr },
            startDate: formData.startDate,
            endDate: formData.endDate || null,
            order: formData.order,
          };
          if (formData.descriptionEn || formData.descriptionFr) {
            data.description = { en: formData.descriptionEn, fr: formData.descriptionFr };
          }
          if (formData.gpa) data.gpa = formData.gpa;

          if (education) {
            await apiClient.updateEducation(education.id, data);
            showToast('Education updated successfully', 'success');
          } else {
            await apiClient.createEducation(data);
            showToast('Education created successfully', 'success');
          }

          hideConfirm();
          onSave();
        } catch (error: any) {
          showToast(`Failed to save: ${error.message}`, 'error');
          setSaving(false);
          hideConfirm();
        }
      },
      education ? 'info' : 'success'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-2xl my-8 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">{education ? 'Edit Education' : 'Create Education'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Degree (English) *</label>
              <input type="text" required value={formData.degreeEn} onChange={(e) => setFormData({ ...formData, degreeEn: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Degree (French) *</label>
              <input type="text" required value={formData.degreeFr} onChange={(e) => setFormData({ ...formData, degreeFr: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Institution (English) *</label>
              <input type="text" required value={formData.institutionEn} onChange={(e) => setFormData({ ...formData, institutionEn: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Institution (French) *</label>
              <input type="text" required value={formData.institutionFr} onChange={(e) => setFormData({ ...formData, institutionFr: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Location (English) *</label>
              <input type="text" required value={formData.locationEn} onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Location (French) *</label>
              <input type="text" required value={formData.locationFr} onChange={(e) => setFormData({ ...formData, locationFr: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Description (English)</label>
              <textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Description (French)</label>
              <textarea value={formData.descriptionFr} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
              <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">GPA</label>
              <input type="text" value={formData.gpa} onChange={(e) => setFormData({ ...formData, gpa: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2 border border-gray-800 text-gray-300 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/50">{saving ? 'Saving...' : 'Save'}</button>
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
          confirmText={education ? 'Update' : 'Create'}
          cancelText="Cancel"
          isLoading={saving}
        />
      </div>
    </div>
  );
}
