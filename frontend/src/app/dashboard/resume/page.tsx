'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Resume } from '@/lib/api/client';
import { Plus, Download, Edit2, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';

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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-white">Loading...</div></div>;

  const activeResume = resumes.find(r => r.isActive);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Resume Management</h2>
            <p className="text-gray-400 mt-1">Upload and manage your resume files</p>
          </div>
          <button onClick={() => { setEditingResume(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50">
            <Plus className="w-4 h-4" />
            Add Resume
          </button>
        </div>

        {activeResume && (
          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Active Resume</h3>
            </div>
            <p className="text-sm text-gray-300 mb-2">{activeResume.filename}</p>
            <a href={activeResume.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors">
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        )}

        <div className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Filename</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-950 divide-y divide-gray-800">
              {resumes.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No resumes found.</td></tr>
              ) : (
                resumes.map((resume) => (
                  <tr key={resume.id} className={resume.isActive ? 'bg-blue-900/20' : ''}>
                    <td className="px-6 py-4 text-sm text-gray-300">{resume.filename}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${resume.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400'}`}>
                        {resume.isActive ? <><CheckCircle className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(resume.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">View</a>
                      <button onClick={() => handleToggleActive(resume.id, resume.isActive)} className="text-green-400 hover:text-green-300 transition-colors">{resume.isActive ? 'Deactivate' : 'Set Active'}</button>
                      <button onClick={() => { setEditingResume(resume); setShowModal(true); }} className="text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(resume.id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">{resume ? 'Edit Resume' : 'Add Resume'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filename *</label>
            <input type="text" required value={formData.filename} onChange={(e) => setFormData({ ...formData, filename: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="My_Resume.pdf" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">File URL *</label>
            <input type="url" required value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com/resume.pdf" />
            <p className="text-xs text-gray-500 mt-1">Upload your resume to a file hosting service and paste the URL here.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded border-gray-800 bg-black text-blue-500 focus:ring-2 focus:ring-blue-500" />
            <label htmlFor="isActive" className="text-sm text-gray-300">Set as active resume</label>
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
