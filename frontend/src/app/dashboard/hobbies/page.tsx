"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { useConfirmModal, useToast } from "@/hooks/useModals";
import { apiClient, Hobby } from "@/lib/api/client";
import { ArrowLeft, Trash2, Edit, Upload, X } from "lucide-react";

export default function HobbiesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    hobbyNameEn: "",
    hobbyNameFr: "",
    descriptionEn: "",
    descriptionFr: "",
    imageUrl: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
        return;
      }
      setUser(session.data.user);
      await loadHobbies();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadHobbies = async () => {
    try {
      const response = await apiClient.getHobbies();
      setHobbies(response.hobbies);
    } catch (error) {
      console.error("Failed to load hobbies:", error);
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
      const uploadResult = await apiClient.uploadHobbyImage(selectedFile);
      console.log("Upload result:", uploadResult);
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

  const handleAddOrUpdateHobby = async () => {
    try {
      const data: any = {
        title: { en: formData.hobbyNameEn, fr: formData.hobbyNameFr },
        description: { en: formData.descriptionEn, fr: formData.descriptionFr },
        order: hobbies.length,
      };

      if (formData.imageUrl) data.imageUrl = formData.imageUrl;

      if (editingHobby) {
        await apiClient.updateHobby(editingHobby.id, data);
        showToast("Hobby updated successfully", "success");
      } else {
        await apiClient.createHobby(data);
        showToast("Hobby created successfully", "success");
      }

      await loadHobbies();
      setFormData({
        hobbyNameEn: "",
        hobbyNameFr: "",
        descriptionEn: "",
        descriptionFr: "",
        imageUrl: "",
      });
      setEditingHobby(null);
      setSelectedFile(null);
    } catch (error: any) {
      showToast(`Failed to save hobby: ${error.message}`, "error");
    }
  };

  const handleEdit = (hobby: Hobby) => {
    setEditingHobby(hobby);
    setFormData({
      hobbyNameEn: hobby.title.en,
      hobbyNameFr: hobby.title.fr,
      descriptionEn: hobby.description?.en || "",
      descriptionFr: hobby.description?.fr || "",
      imageUrl: hobby.imageUrl || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingHobby(null);
    setFormData({
      hobbyNameEn: "",
      hobbyNameFr: "",
      descriptionEn: "",
      descriptionFr: "",
      imageUrl: "",
    });
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Delete Hobby",
      "Are you sure you want to delete this hobby? This action cannot be undone.",
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteHobby(id);
          await loadHobbies();
          showToast("Hobby deleted successfully", "success");
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
          <h2 className="text-2xl font-bold">Hobbies</h2>
        </div>

        {/* Add/Edit Hobby Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editingHobby ? "Edit Hobby" : "Add New Hobby"}
          </h3>

          {/* Bilingual Title Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Hobby Name (English)
              </label>
              <input
                type="text"
                placeholder="e.g., Photography"
                value={formData.hobbyNameEn}
                onChange={(e) =>
                  setFormData({ ...formData, hobbyNameEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du Loisir (Français)
              </label>
              <input
                type="text"
                placeholder="p.ex., Photographie"
                value={formData.hobbyNameFr}
                onChange={(e) =>
                  setFormData({ ...formData, hobbyNameFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Bilingual Description Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (English)
              </label>
              <textarea
                placeholder="Describe your hobby in English"
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
                placeholder="Décrivez votre loisir en français"
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
              Hobby Image
            </label>
            
            {/* Upload Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploadMode === 'url'
                    ? 'bg-foreground text-background'
                    : 'bg-background border hover:bg-muted'
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-foreground text-background'
                    : 'bg-background border hover:bg-muted'
                }`}
              >
                Upload File
              </button>
            </div>

            {/* URL Input */}
            {uploadMode === 'url' && (
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            )}

            {/* File Upload */}
            {uploadMode === 'file' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedFile ? selectedFile.name : 'Choose image...'}
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
                      onClick={handleUploadFile}
                      disabled={uploading}
                      className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Max file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
                </p>
              </div>
            )}

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="mt-4 p-4 bg-muted rounded-lg border-2 border-dashed">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium">Current Image:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative h-64 bg-background rounded-lg overflow-hidden border">
                  <img
                    src={formData.imageUrl}
                    alt="Hobby preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', formData.imageUrl);
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Failed to load image';
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 break-all">
                  {formData.imageUrl}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdateHobby}
              disabled={
                !formData.hobbyNameEn ||
                !formData.hobbyNameFr ||
                !formData.descriptionEn ||
                !formData.descriptionFr
              }
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingHobby ? "Update Hobby" : "+ Add Hobby"}
            </button>
            {editingHobby && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing Hobbies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hobbies.map((hobby) => (
            <div key={hobby.id} className="border rounded-lg p-6">
              {/* Image Preview */}
              {hobby.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-muted border h-48">
                  <img
                    src={hobby.imageUrl}
                    alt={hobby.title.en}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{hobby.title.en}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(hobby)}
                    className="text-foreground hover:opacity-70 transition-opacity p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(hobby.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {hobby.description && (
                <p className="text-sm text-muted-foreground">
                  {hobby.description.en}
                </p>
              )}
            </div>
          ))}
          {hobbies.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              No hobbies found. Add your first hobby above.
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

function HobbyModal({ hobby, onClose, onSave, showToast }: any) {
  const [formData, setFormData] = useState({
    titleEn: hobby?.title.en || "",
    titleFr: hobby?.title.fr || "",
    descriptionEn: hobby?.description?.en || "",
    descriptionFr: hobby?.description?.fr || "",
    imageUrl: hobby?.imageUrl || "",
    color: hobby?.color || "#3B82F6",
    order: hobby?.order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        title: { en: formData.titleEn, fr: formData.titleFr },
        order: formData.order,
      };
      if (formData.descriptionEn || formData.descriptionFr) {
        data.description = {
          en: formData.descriptionEn,
          fr: formData.descriptionFr,
        };
      }
      if (formData.imageUrl) data.imageUrl = formData.imageUrl;
      if (formData.color) data.color = formData.color;

      if (hobby) await apiClient.updateHobby(hobby.id, data);
      else await apiClient.createHobby(data);
      onSave();
    } catch (error: any) {
      showToast(`Failed to save: ${error.message}`, "error");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">
          {hobby ? "Edit Hobby" : "Create Hobby"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.titleEn}
                onChange={(e) =>
                  setFormData({ ...formData, titleEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title (French) *
              </label>
              <input
                type="text"
                required
                value={formData.titleFr}
                onChange={(e) =>
                  setFormData({ ...formData, titleFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (English)
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (French)
              </label>
              <textarea
                value={formData.descriptionFr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionFr: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#3B82F6"
                className="w-full px-3 py-2 bg-black border border-gray-800 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
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
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
