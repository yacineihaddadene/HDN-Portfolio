'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useConfirmModal, useToast } from '@/hooks/useModals';
import { apiClient, Skill } from '@/lib/api/client';

export default function SkillsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
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
      await loadSkills();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadSkills = async () => {
    try {
      const response = await apiClient.getSkills();
      setSkills(response.skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      'Delete Skill',
      'Are you sure you want to delete this skill? This action cannot be undone.',
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteSkill(id);
          await loadSkills();
          showToast('Skill deleted successfully', 'success');
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

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingSkill(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Skills Management</h2>
            <p className="text-gray-400 mt-1">Manage your technical and soft skills</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20"
          >
            Add Skill
          </button>
        </div>

        {/* Skills List */}
        <div className="bg-black border border-gray-900 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-900">
            <thead className="bg-gray-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name (FR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-900">
              {skills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No skills found. Click &quot;Add Skill&quot; to create one.
                  </td>
                </tr>
              ) : (
                skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-950 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {skill.name.en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {skill.name.fr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SkillModal
          skill={editingSkill}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            await loadSkills();
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

function SkillModal({ skill, onClose, onSave, showToast }: any) {
  const [formData, setFormData] = useState({
    nameEn: skill?.name.en || '',
    nameFr: skill?.name.fr || '',
    category: skill?.category || '',
    order: skill?.order || 0,
  });
  const [saving, setSaving] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const action = skill ? 'update' : 'create';
    const title = skill ? 'Update Skill' : 'Create Skill';
    const message = skill 
      ? 'Are you sure you want to update this skill?' 
      : 'Are you sure you want to create this skill?';

    showConfirm(
      title,
      message,
      async () => {
        setSaving(true);
        try {
          const data = {
            name: { en: formData.nameEn, fr: formData.nameFr },
            category: formData.category,
            order: formData.order,
          };

          if (skill) {
            await apiClient.updateSkill(skill.id, data);
            showToast('Skill updated successfully', 'success');
          } else {
            await apiClient.createSkill(data);
            showToast('Skill created successfully', 'success');
          }

          hideConfirm();
          onSave();
        } catch (error: any) {
          showToast(`Failed to save: ${error.message}`, 'error');
          setSaving(false);
          hideConfirm();
        }
      },
      skill ? 'info' : 'success'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">
          {skill ? 'Edit Skill' : 'Create Skill'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name (English) *
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name (French) *
            </label>
            <input
              type="text"
              required
              value={formData.nameFr}
              onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
              placeholder="e.g., Programming, Design, Tools"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {saving ? 'Saving...' : 'Save'}
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
          confirmText={skill ? 'Update' : 'Create'}
          cancelText="Cancel"
          isLoading={saving}
        />
      </div>
    </div>
  );
}
