'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Skill } from '@/lib/api/client';

export default function SkillsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
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
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await apiClient.deleteSkill(id);
      await loadSkills();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
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
            <h2 className="text-2xl font-bold">Skills Management</h2>
            <p className="text-gray-600 mt-1">Manage your technical and soft skills</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Add Skill
          </button>
        </div>

        {/* Skills List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name (FR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No skills found. Click &quot;Add Skill&quot; to create one.
                  </td>
                </tr>
              ) : (
                skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skill.name.en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skill.name.fr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="text-red-600 hover:text-red-900"
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
        />
      )}
    </DashboardLayout>
  );
}

function SkillModal({ skill, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    nameEn: skill?.name.en || '',
    nameFr: skill?.name.fr || '',
    category: skill?.category || '',
    order: skill?.order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name: { en: formData.nameEn, fr: formData.nameFr },
        category: formData.category,
        order: formData.order,
      };

      if (skill) {
        await apiClient.updateSkill(skill.id, data);
      } else {
        await apiClient.createSkill(data);
      }

      onSave();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {skill ? 'Edit Skill' : 'Create Skill'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (English) *
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (French) *
            </label>
            <input
              type="text"
              required
              value={formData.nameFr}
              onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Programming, Design, Tools"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
