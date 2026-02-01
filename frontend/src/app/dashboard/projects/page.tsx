'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Project } from '@/lib/api/client';

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }
      setUser(session.data.user);
      await loadProjects();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      setProjects(response.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.deleteProject(id);
      await loadProjects();
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
            <h2 className="text-2xl font-bold">Projects Management</h2>
            <p className="text-gray-600 mt-1">Manage your portfolio projects</p>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {project.imageUrl && (
                <div className="h-48 bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.imageUrl}
                    alt={project.title.en}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{project.title.en}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {project.description.en}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies?.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies && project.technologies.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'published' ? 'bg-green-100 text-green-800' :
                    project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No projects found. Click &quot;Add Project&quot; to create one.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            await loadProjects();
            setShowModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function ProjectModal({ project, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    titleEn: project?.title.en || '',
    titleFr: project?.title.fr || '',
    descriptionEn: project?.description.en || '',
    descriptionFr: project?.description.fr || '',
    fullDescriptionEn: project?.fullDescription?.en || '',
    fullDescriptionFr: project?.fullDescription?.fr || '',
    client: project?.client || '',
    projectUrl: project?.projectUrl || '',
    githubUrl: project?.githubUrl || '',
    technologies: project?.technologies?.join(', ') || '',
    imageUrl: project?.imageUrl || '',
    color: project?.color || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    status: project?.status || 'draft',
    featured: project?.featured || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data: any = {
        title: { en: formData.titleEn, fr: formData.titleFr },
        description: { en: formData.descriptionEn, fr: formData.descriptionFr },
        status: formData.status,
        featured: formData.featured,
      };

      if (formData.fullDescriptionEn || formData.fullDescriptionFr) {
        data.fullDescription = {
          en: formData.fullDescriptionEn,
          fr: formData.fullDescriptionFr,
        };
      }
      if (formData.client) data.client = formData.client;
      if (formData.projectUrl) data.projectUrl = formData.projectUrl;
      if (formData.githubUrl) data.githubUrl = formData.githubUrl;
      if (formData.technologies) {
        data.technologies = formData.technologies.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      if (formData.imageUrl) data.imageUrl = formData.imageUrl;
      if (formData.color) data.color = formData.color;
      if (formData.startDate) data.startDate = formData.startDate;
      if (formData.endDate) data.endDate = formData.endDate;

      if (project) {
        await apiClient.updateProject(project.id, data);
      } else {
        await apiClient.createProject(data);
      }

      onSave();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
        <h3 className="text-xl font-bold mb-4">
          {project ? 'Edit Project' : 'Create Project'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (French) *
              </label>
              <input
                type="text"
                required
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
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
                rows={3}
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description (English)
              </label>
              <textarea
                value={formData.fullDescriptionEn}
                onChange={(e) => setFormData({ ...formData, fullDescriptionEn: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description (French)
              </label>
              <textarea
                value={formData.fullDescriptionFr}
                onChange={(e) => setFormData({ ...formData, fullDescriptionFr: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="React, Node.js, MongoDB"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
              <input
                type="url"
                value={formData.projectUrl}
                onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">
              Featured Project
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
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
