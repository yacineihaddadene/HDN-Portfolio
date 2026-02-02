'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useConfirmModal, useToast } from '@/hooks/useModals';
import { apiClient, Resume } from '@/lib/api/client';
import { Plus, Download, Edit2, Trash2, FileText, CheckCircle, XCircle, Upload } from 'lucide-react';

export default function ResumePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
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
    showConfirm(
      'Delete Resume',
      'Are you sure you want to delete this resume? This action cannot be undone.',
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteResume(id);
          await loadResumes();
          showToast('Resume deleted successfully', 'success');
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

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiClient.updateResume(id, { isActive: !isActive });
      await loadResumes();
      showToast(`Resume ${!isActive ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error: any) {
      showToast(`Failed to update: ${error.message}`, 'error');
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-950 divide-y divide-gray-800">
              {resumes.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No resumes found.</td></tr>
              ) : (
                resumes.map((resume) => (
                  <tr key={resume.id} className={resume.isActive ? 'bg-blue-900/20' : ''}>
                    <td className="px-6 py-4 text-sm text-gray-300">{resume.filename}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-800 text-gray-300 border border-gray-700">
                        {resume.language === 'fr' ? 'French' : 'English'}
                      </span>
                    </td>
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

      {showModal && <ResumeModal resume={editingResume} onClose={() => setShowModal(false)} onSave={async () => { await loadResumes(); setShowModal(false); }} showToast={showToast} />}

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

function ResumeModal({ resume, onClose, onSave, showToast }: any) {
  const [formData, setFormData] = useState({
    filename: resume?.filename || '',
    fileUrl: resume?.fileUrl || '',
    language: resume?.language || 'en',
    isActive: resume?.isActive || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please upload a PDF file', 'warning');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showToast('File size must be less than 10MB', 'warning');
        return;
      }
      setSelectedFile(file);
      setFormData({ ...formData, filename: file.name });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please upload a PDF file', 'warning');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'warning');
        return;
      }
      setSelectedFile(file);
      setFormData({ ...formData, filename: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileUrl = formData.fileUrl;

      // If file upload mode and a file is selected, upload to DigitalOcean Spaces
      if (uploadMode === 'file' && selectedFile) {
        const uploadResult = await apiClient.uploadResumeFile(selectedFile);
        fileUrl = uploadResult.fileUrl;
      }

      const dataToSave = {
        filename: formData.filename,
        fileUrl: fileUrl,
        language: formData.language,
        isActive: formData.isActive,
      };

      if (resume) {
        await apiClient.updateResume(resume.id, dataToSave);
      } else {
        await apiClient.createResume(dataToSave);
      }
      onSave();
    } catch (error: any) {
      showToast(`Failed to save: ${error.message}`, 'error');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-white">{resume ? 'Edit Resume' : 'Upload Resume'}</h3>
        
        {/* Upload Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadMode === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadMode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Use URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadMode === 'file' ? (
            <>
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload PDF File</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-blue-400" />
                      <p className="text-sm text-gray-300 font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-gray-600" />
                      <p className="text-sm text-gray-400">
                        Drag & drop your resume here or
                      </p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm font-medium">
                          browse files
                        </span>
                      </label>
                      <p className="text-xs text-gray-600">PDF only, max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Filename (auto-filled from file) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Filename</label>
                <input
                  type="text"
                  required
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My_Resume.pdf"
                />
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* URL Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Filename *</label>
                <input
                  type="text"
                  required
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My_Resume.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">File URL *</label>
                <input
                  type="url"
                  required
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/resume.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your resume to a file hosting service (Google Drive, Dropbox, etc.) and paste the public URL here.
                </p>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </>
          )}

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-800 bg-black text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">
              Set as active resume (visible on landing page)
            </label>
          </div>

          {/* Action Buttons */}
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
              disabled={saving || (uploadMode === 'file' && !selectedFile && !resume)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
