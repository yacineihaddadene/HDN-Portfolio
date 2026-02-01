'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Education } from '@/lib/api/client';

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [education, setEducation] = useState<Education[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
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
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    try {
      await apiClient.deleteEducation(id);
      await loadEducation();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="text-lg">Loading...</div></div>;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Education</h2>
            <p className="text-gray-600 mt-1">Manage your educational background</p>
          </div>
          <button
            onClick={() => { setEditingEducation(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Add Education
          </button>
        </div>

        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree.en}</h3>
                  <p className="text-md text-gray-700 mt-1">{edu.institution.en}</p>
                  <p className="text-sm text-gray-500">{edu.location.en}</p>
                  {edu.description && <p className="text-sm text-gray-600 mt-2">{edu.description.en}</p>}
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                    <span>📅 {edu.startDate} - {edu.endDate || 'Present'}</span>
                    {edu.gpa && <span>📊 GPA: {edu.gpa}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEducation(edu); setShowModal(true); }} className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button onClick={() => handleDelete(edu.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {education.length === 0 && <div className="text-center py-12 text-gray-500">No education entries found.</div>}
        </div>
      </div>

      {showModal && (
        <EducationModal education={editingEducation} onClose={() => setShowModal(false)} onSave={async () => { await loadEducation(); setShowModal(false); }} />
      )}
    </DashboardLayout>
  );
}

function EducationModal({ education, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    degreeEn: education?.degree.en || '', degreeFr: education?.degree.fr || '',
    institutionEn: education?.institution.en || '', institutionFr: education?.institution.fr || '',
    locationEn: education?.location.en || '', locationFr: education?.location.fr || '',
    descriptionEn: education?.description?.en || '', descriptionFr: education?.description?.fr || '',
    startDate: education?.startDate || '', endDate: education?.endDate || '',
    gpa: education?.gpa || '', order: education?.order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        await apiClient.createEducation(data);
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
        <h3 className="text-xl font-bold mb-4">{education ? 'Edit Education' : 'Create Education'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Degree (English) *</label>
              <input type="text" required value={formData.degreeEn} onChange={(e) => setFormData({ ...formData, degreeEn: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Degree (French) *</label>
              <input type="text" required value={formData.degreeFr} onChange={(e) => setFormData({ ...formData, degreeFr: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Institution (English) *</label>
              <input type="text" required value={formData.institutionEn} onChange={(e) => setFormData({ ...formData, institutionEn: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Institution (French) *</label>
              <input type="text" required value={formData.institutionFr} onChange={(e) => setFormData({ ...formData, institutionFr: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Location (English) *</label>
              <input type="text" required value={formData.locationEn} onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Location (French) *</label>
              <input type="text" required value={formData.locationFr} onChange={(e) => setFormData({ ...formData, locationFr: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Description (English)</label>
              <textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Description (French)</label>
              <textarea value={formData.descriptionFr} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Start Date *</label>
              <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">GPA</label>
              <input type="text" value={formData.gpa} onChange={(e) => setFormData({ ...formData, gpa: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
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
