"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { useConfirmModal, useToast } from "@/hooks/useModals";
import { apiClient, Education } from "@/lib/api/client";
import { ArrowLeft, Trash2, Edit } from "lucide-react";

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [education, setEducation] = useState<Education[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    institutionEn: "",
    institutionFr: "",
    degreeEn: "",
    degreeFr: "",
    locationEn: "",
    locationFr: "",
    startYear: "",
    endYear: "",
    descriptionEn: "",
    descriptionFr: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
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
      console.error("Failed to load education:", error);
    }
  };

  const handleAddOrUpdateEducation = async () => {
    try {
      const data: any = {
        institution: { en: formData.institutionEn, fr: formData.institutionFr },
        degree: { en: formData.degreeEn, fr: formData.degreeFr },
        location: {
          en: formData.locationEn || "N/A",
          fr: formData.locationFr || "N/A",
        },
        startDate: formData.startYear,
        order: education.length,
      };

      if (formData.endYear) data.endDate = formData.endYear;
      if (formData.descriptionEn || formData.descriptionFr) {
        data.description = {
          en: formData.descriptionEn,
          fr: formData.descriptionFr,
        };
      }

      if (editingEducation) {
        await apiClient.updateEducation(editingEducation.id, data);
        showToast("Education updated successfully", "success");
      } else {
        await apiClient.createEducation(data);
        showToast("Education created successfully", "success");
      }

      await loadEducation();

      // Reset form
      setFormData({
        institutionEn: "",
        institutionFr: "",
        degreeEn: "",
        degreeFr: "",
        locationEn: "",
        locationFr: "",
        startYear: "",
        endYear: "",
        descriptionEn: "",
        descriptionFr: "",
      });
      setEditingEducation(null);
    } catch (error: any) {
      showToast(`Failed to save education: ${error.message}`, "error");
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      institutionEn: edu.institution.en,
      institutionFr: edu.institution.fr,
      degreeEn: edu.degree.en,
      degreeFr: edu.degree.fr,
      locationEn: edu.location?.en || "",
      locationFr: edu.location?.fr || "",
      startYear: edu.startDate,
      endYear: edu.endDate || "",
      descriptionEn: edu.description?.en || "",
      descriptionFr: edu.description?.fr || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingEducation(null);
    setFormData({
      institutionEn: "",
      institutionFr: "",
      degreeEn: "",
      degreeFr: "",
      locationEn: "",
      locationFr: "",
      startYear: "",
      endYear: "",
      descriptionEn: "",
      descriptionFr: "",
    });
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Delete Education",
      "Are you sure you want to delete this education entry? This action cannot be undone.",
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteEducation(id);
          await loadEducation();
          showToast("Education deleted successfully", "success");
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
          <h2 className="text-2xl font-bold">Education</h2>
        </div>

        {/* Add/Edit Education Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editingEducation ? "Edit Education" : "Add New Education"}
          </h3>

          {/* Institution - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Institution (English)
              </label>
              <input
                type="text"
                placeholder="Champlain College"
                value={formData.institutionEn}
                onChange={(e) =>
                  setFormData({ ...formData, institutionEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Institution (Français)
              </label>
              <input
                type="text"
                placeholder="Collège Champlain"
                value={formData.institutionFr}
                onChange={(e) =>
                  setFormData({ ...formData, institutionFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Degree - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Degree (English)
              </label>
              <input
                type="text"
                placeholder="Computer Science"
                value={formData.degreeEn}
                onChange={(e) =>
                  setFormData({ ...formData, degreeEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Diplôme (Français)
              </label>
              <input
                type="text"
                placeholder="Informatique"
                value={formData.degreeFr}
                onChange={(e) =>
                  setFormData({ ...formData, degreeFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Location - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Location (English)
              </label>
              <input
                type="text"
                placeholder="St-Lambert,QC"
                value={formData.locationEn}
                onChange={(e) =>
                  setFormData({ ...formData, locationEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Emplacement (Français)
              </label>
              <input
                type="text"
                placeholder="St-Lambert,QC"
                value={formData.locationFr}
                onChange={(e) =>
                  setFormData({ ...formData, locationFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Year
              </label>
              <input
                type="text"
                placeholder="2022-08-20"
                value={formData.startYear}
                onChange={(e) =>
                  setFormData({ ...formData, startYear: e.target.value })
                }
                className="px-3 py-2 w-full bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Year</label>
              <input
                type="text"
                placeholder="2026-05-18"
                value={formData.endYear}
                onChange={(e) =>
                  setFormData({ ...formData, endYear: e.target.value })
                }
                className="px-3 py-2 w-full bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Description - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (English) - Optional
              </label>
              <textarea
                placeholder="My Computer Science program has strengthened my problem-solving..."
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Français) - Optionnel
              </label>
              <textarea
                placeholder="Mon programme d'informatique a renforcé mes compétences en résolution de problèmes..."
                value={formData.descriptionFr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionFr: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdateEducation}
              disabled={
                !formData.institutionEn ||
                !formData.institutionFr ||
                !formData.degreeEn ||
                !formData.degreeFr ||
                !formData.startYear
              }
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingEducation ? "Update Education" : "+ Add Education"}
            </button>
            {editingEducation && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing Education List */}
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {edu.institution.en}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {edu.degree.en}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.endDate || "2020"}
                  </span>
                  <button
                    onClick={() => handleEdit(edu)}
                    className="text-foreground hover:opacity-70 transition-opacity p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {edu.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {edu.description.en}
                </p>
              )}
            </div>
          ))}
          {education.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No education entries found. Add your first education above.
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
