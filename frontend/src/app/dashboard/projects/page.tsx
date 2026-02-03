"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { useConfirmModal, useToast } from "@/hooks/useModals";
import { apiClient, Project } from "@/lib/api/client";
import { ArrowLeft, Trash2, Edit, Upload, X } from "lucide-react";

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    titleEn: "",
    titleFr: "",
    descriptionEn: "",
    descriptionFr: "",
    imageUrl: "",
    category: "",
    year: "",
    technologies: [] as string[],
    techInput: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
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
      console.error("Failed to load projects:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      showToast("Please select an image file", "error");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      showToast("Uploading image...", "info");
      const uploadResult = await apiClient.uploadProjectImage(selectedFile);
      console.log("Upload result:", uploadResult);
      console.log("File URL:", uploadResult.fileUrl);
      setFormData({ ...formData, imageUrl: uploadResult.fileUrl });
      showToast("Image uploaded successfully", "success");
      setSelectedFile(null);
      setUploadMode("url");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(`Failed to upload: ${error.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddOrUpdateProject = async () => {
    try {
      const data: any = {
        title: { en: formData.titleEn, fr: formData.titleFr },
        description: { en: formData.descriptionEn, fr: formData.descriptionFr },
        status: "published",
        featured: false,
      };

      if (formData.imageUrl) data.imageUrl = formData.imageUrl;
      if (formData.year) data.startDate = formData.year;
      if (formData.technologies.length > 0)
        data.technologies = formData.technologies;

      if (editingProject) {
        await apiClient.updateProject(editingProject.id, data);
        showToast("Project updated successfully", "success");
      } else {
        await apiClient.createProject(data);
        showToast("Project created successfully", "success");
      }

      await loadProjects();

      // Reset form
      setFormData({
        titleEn: "",
        titleFr: "",
        descriptionEn: "",
        descriptionFr: "",
        imageUrl: "",
        category: "",
        year: "",
        technologies: [],
        techInput: "",
      });
      setEditingProject(null);
      setSelectedFile(null);
    } catch (error: any) {
      showToast(`Failed to save project: ${error.message}`, "error");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      titleEn: project.title.en,
      titleFr: project.title.fr,
      descriptionEn: project.description.en,
      descriptionFr: project.description.fr,
      imageUrl: project.imageUrl || "",
      category: "",
      year: project.startDate || "",
      technologies: project.technologies || [],
      techInput: "",
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData({
      titleEn: "",
      titleFr: "",
      descriptionEn: "",
      descriptionFr: "",
      imageUrl: "",
      category: "",
      year: "",
      technologies: [],
      techInput: "",
    });
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone.",
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteProject(id);
          await loadProjects();
          showToast("Project deleted successfully", "success");
        } catch (error: any) {
          showToast(`Failed to delete: ${error.message}`, "error");
        } finally {
          setIsDeleting(false);
          hideConfirm();
        }
      },
      "danger",
    );
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
        {/* Header with Back Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Projects</h2>
        </div>

        {/* Add New Project Form */}
        <div className="border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold">
            {editingProject ? "Edit Project" : "Add New Project"}
          </h3>

          {/* Title - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Title (English)
              </label>
              <input
                type="text"
                placeholder="My Portfolio Website"
                value={formData.titleEn}
                onChange={(e) =>
                  setFormData({ ...formData, titleEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Titre du Projet (Français)
              </label>
              <input
                type="text"
                placeholder="Mon Site Web Portfolio"
                value={formData.titleFr}
                onChange={(e) =>
                  setFormData({ ...formData, titleFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Description - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (English)
              </label>
              <textarea
                placeholder="A modern portfolio website showcasing my skills and projects..."
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Français)
              </label>
              <textarea
                placeholder="Un site web portfolio moderne présentant mes compétences et projets..."
                value={formData.descriptionFr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionFr: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Image
            </label>
            <div className="space-y-4">
              {/* Upload Method Selection */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadMode === "url"
                      ? "bg-foreground text-background"
                      : "border hover:bg-muted"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadMode === "file"
                      ? "bg-foreground text-background"
                      : "border hover:bg-muted"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {uploadMode === "url" ? (
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-lg hover:bg-muted transition-colors">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedFile
                            ? selectedFile.name
                            : "Choose an image file..."}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {selectedFile && !formData.imageUrl && (
                    <button
                      type="button"
                      onClick={handleUploadFile}
                      disabled={uploading}
                      className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                  )}
                  {formData.imageUrl && (
                    <p className="text-sm text-green-500">
                      ✓ Image uploaded successfully
                    </p>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Preview:</p>
                  <div className="relative border-2 border-dashed rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-muted"
                      onError={(e) => {
                        console.error("Failed to load image:", formData.imageUrl);
                        showToast("Failed to load image preview", "error");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, imageUrl: "" });
                        setSelectedFile(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground break-all">
                    {formData.imageUrl}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <input
              type="text"
              placeholder="2026"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          {/* Technologies */}          <input
            type="text"
            placeholder="Add technology (press Enter)"
            value={formData.techInput}
            onChange={(e) =>
              setFormData({ ...formData, techInput: e.target.value })
            }
            onKeyPress={(e) => {
              if (e.key === "Enter" && formData.techInput.trim()) {
                e.preventDefault();
                setFormData({
                  ...formData,
                  technologies: [
                    ...formData.technologies,
                    formData.techInput.trim(),
                  ],
                  techInput: "",
                });
              }
            }}
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />

          {formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-foreground text-background rounded-lg text-sm flex items-center gap-2"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        technologies: formData.technologies.filter(
                          (_, idx) => idx !== i,
                        ),
                      });
                    }}
                    className="hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdateProject}
              disabled={
                !formData.titleEn ||
                !formData.titleFr ||
                !formData.descriptionEn ||
                !formData.descriptionFr
              }
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingProject ? "Update Project" : "+ Add Project"}
            </button>
            {editingProject && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg overflow-hidden hover:border-foreground/20 transition-colors"
            >
              {project.imageUrl && (
                <div className="aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.imageUrl}
                    alt={project.title.en}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {project.title.en}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description.en?.split(" ").slice(0, 3).join(" ")}
                      ... • {project.startDate || "2024"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-foreground hover:opacity-70 transition-opacity p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description.en}
                </p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-foreground text-background rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No projects found. Add your first project above.
            </div>
          )}
        </div>
      </div>

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
