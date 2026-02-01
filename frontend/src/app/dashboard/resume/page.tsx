'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Resume } from '@/lib/api/client';

export default function ResumePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }
      setUser(session.data.user);
      await loadResumes();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadResumes = async () => {
    try {
      const response = await apiClient.getResumes();
      setResumes(response.resumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await apiClient.deleteResume(id);
      await loadResumes();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiClient.updateResume(id, { isActive: !isActive });
      await loadResumes();
    } catch (error: any) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div>Loading...</div></div>;

  const activeResume = resumes.find(r => r.isActive);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Resume Management</h2>
            <p className="text-gray-600 mt-1">Upload and manage your resume files</p>
          </div>
          <button onClick={() => { setEditingResume(null); setShowModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">➕ Add Resume</button>
        </div>

        {activeResume && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📄</span>
              <h3 className="text-lg font-semibold">Active Resume</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">{activeResume.filename}</p>
            <a href={activeResume.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              📥 Download
            </a>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resumes.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No resumes found.</td></tr>
              ) : (
                resumes.map((resume) => (
                  <tr key={resume.id} className={resume.isActive ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 text-sm text-gray-900">{resume.filename}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded ${resume.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {resume.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(resume.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">View</a>
                      <button onClick={() => handleToggleActive(resume.id, resume.isActive)} className="text-green-600 hover:text-green-900">{resume.isActive ? 'Deactivate' : 'Set Active'}</button>
                      <button onClick={() => { setEditingResume(resume); setShowModal(true); }} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(resume.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <ResumeModal resume={editingResume} onClose={() => setShowModal(false)} onSave={async () => { await loadResumes(); setShowModal(false); }} />}
    </DashboardLayout>
  );
}

function ResumeModal({ resume, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    filename: resume?.filename || '',
    fileUrl: resume?.fileUrl || '',
    isActive: resume?.isActive || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (resume) {
        await apiClient.updateResume(resume.id, formData);
      } else {
        await apiClient.createResume(formData);
      }
      onSave();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{resume ? 'Edit Resume' : 'Add Resume'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filename *</label>
            <input type="text" required value={formData.filename} onChange={(e) => setFormData({ ...formData, filename: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="My_Resume.pdf" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File URL *</label>
            <input type="url" required value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="https://example.com/resume.pdf" />
            <p className="text-xs text-gray-500 mt-1">Upload your resume to a file hosting service and paste the URL here.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
            <label htmlFor="isActive" className="text-sm">Set as active resume</label>
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
