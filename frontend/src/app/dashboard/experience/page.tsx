'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, WorkExperience } from '@/lib/api/client';

export default function ExperiencePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
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
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await apiClient.deleteExperience(id);
      await loadExperiences();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Work Experience</h2>
            <p className="text-gray-600 mt-1">Manage your professional experience</p>
          </div>
          <button
            onClick={() => {
              setEditingExperience(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Add Experience
          </button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{exp.position.en}</h3>
                  <p className="text-md text-gray-700 mt-1">{exp.company.en}</p>
                  <p className="text-sm text-gray-500">{exp.location.en}</p>
                  <p className="text-sm text-gray-600 mt-2">{exp.description.en}</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                    <span>📅 {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'N/A'}</span>
                    {exp.current && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
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
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-600 hover:text-red-900"
                  >
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
        />
      )}
    </DashboardLayout>
  );
}

function ExperienceModal({ experience, onClose, onSave }: any) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        await apiClient.createExperience(data);
      }

      onSave();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
        <h3 className="text-xl font-bold mb-4">
          {experience ? 'Edit Experience' : 'Create Experience'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position (English) *
              </label>
              <input
                type="text"
                required
                value={formData.positionEn}
                onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position (French) *
              </label>
              <input
                type="text"
                required
                value={formData.positionFr}
                onChange={(e) => setFormData({ ...formData, positionFr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company (English) *
              </label>
              <input
                type="text"
                required
                value={formData.companyEn}
                onChange={(e) => setFormData({ ...formData, companyEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company (French) *
              </label>
              <input
                type="text"
                required
                value={formData.companyFr}
                onChange={(e) => setFormData({ ...formData, companyFr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (English) *
              </label>
              <input
                type="text"
                required
                value={formData.locationEn}
                onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (French) *
              </label>
              <input
                type="text"
                required
                value={formData.locationFr}
                onChange={(e) => setFormData({ ...formData, locationFr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (English) *
              </label>
              <textarea
                required
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (French) *
              </label>
              <textarea
                required
                value={formData.descriptionFr}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                disabled={formData.current}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="current"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
              className="rounded border-gray-300"
            />
            <label htmlFor="current" className="text-sm text-gray-700">
              I currently work here
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
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
              {saving ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
