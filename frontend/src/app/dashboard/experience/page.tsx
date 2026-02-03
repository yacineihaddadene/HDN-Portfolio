"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { useConfirmModal, useToast } from "@/hooks/useModals";
import { apiClient, WorkExperience } from "@/lib/api/client";
import { ArrowLeft, Trash2, Plus, Edit } from "lucide-react";

export default function ExperiencePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<WorkExperience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyEn: "",
    companyFr: "",
    roleEn: "",
    roleFr: "",
    locationEn: "",
    locationFr: "",
    startDate: "",
    endDate: "",
    descriptionEn: "",
    descriptionFr: "",
    achievements: [] as string[],
    achievementInput: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
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
      console.error("Failed to load experiences:", error);
    }
  };

  const handleAddOrUpdateExperience = async () => {
    try {
      const data: any = {
        position: { en: formData.roleEn, fr: formData.roleFr },
        company: { en: formData.companyEn, fr: formData.companyFr },
        location: { en: formData.locationEn, fr: formData.locationFr },
        description: { en: formData.descriptionEn, fr: formData.descriptionFr },
        startDate: formData.startDate,
        current: false,
        order: experiences.length,
      };

      if (formData.endDate) data.endDate = formData.endDate;

      if (editingExperience) {
        await apiClient.updateExperience(editingExperience.id, data);
        showToast("Experience updated successfully", "success");
      } else {
        await apiClient.createExperience(data);
        showToast("Experience created successfully", "success");
      }

      await loadExperiences();

      // Reset form
      setFormData({
        companyEn: "",
        companyFr: "",
        roleEn: "",
        roleFr: "",
        locationEn: "",
        locationFr: "",
        startDate: "",
        endDate: "",
        descriptionEn: "",
        descriptionFr: "",
        achievements: [],
        achievementInput: "",
      });
      setEditingExperience(null);
    } catch (error: any) {
      showToast(`Failed to save experience: ${error.message}`, "error");
    }
  };

  const handleEdit = (exp: WorkExperience) => {
    setEditingExperience(exp);
    setFormData({
      companyEn: exp.company.en,
      companyFr: exp.company.fr,
      roleEn: exp.position.en,
      roleFr: exp.position.fr,
      locationEn: exp.location?.en || "",
      locationFr: exp.location?.fr || "",
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      descriptionEn: exp.description?.en || "",
      descriptionFr: exp.description?.fr || "",
      achievements: [],
      achievementInput: "",
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingExperience(null);
    setFormData({
      companyEn: "",
      companyFr: "",
      roleEn: "",
      roleFr: "",
      locationEn: "",
      locationFr: "",
      startDate: "",
      endDate: "",
      descriptionEn: "",
      descriptionFr: "",
      achievements: [],
      achievementInput: "",
    });
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Delete Experience",
      "Are you sure you want to delete this work experience? This action cannot be undone.",
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteExperience(id);
          await loadExperiences();
          showToast("Experience deleted successfully", "success");
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
          <h2 className="text-2xl font-bold">Experience</h2>
        </div>

        {/* Add New Experience Form */}
        <div className="border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold">
            {editingExperience ? "Edit Experience" : "Add New Experience"}
          </h3>

          {/* Company - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Company (English)
              </label>
              <input
                type="text"
                placeholder="Cavavin"
                value={formData.companyEn}
                onChange={(e) =>
                  setFormData({ ...formData, companyEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Entreprise (Français)
              </label>
              <input
                type="text"
                placeholder="Cavavin"
                value={formData.companyFr}
                onChange={(e) =>
                  setFormData({ ...formData, companyFr: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Role - Bilingual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Position (English)
              </label>
              <input
                type="text"
                placeholder="Worker"
                value={formData.roleEn}
                onChange={(e) =>
                  setFormData({ ...formData, roleEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Poste (Français)
              </label>
              <input
                type="text"
                placeholder="Travailleur"
                value={formData.roleFr}
                onChange={(e) =>
                  setFormData({ ...formData, roleFr: e.target.value })
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
                placeholder="St-Hubert"
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
                placeholder="St-Hubert"
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
                Start Date
              </label>
              <input
                type="text"
                placeholder="2021-06-01"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="text"
                placeholder="2024-12-01"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
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
                placeholder="Handling the organization and sorting of wine cellars..."
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
                Description (Français)
              </label>
              <textarea
                placeholder="Gérer l'organisation et le tri des caves à vin..."
                value={formData.descriptionFr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionFr: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Add achievement (press Enter)"
            value={formData.achievementInput}
            onChange={(e) =>
              setFormData({ ...formData, achievementInput: e.target.value })
            }
            onKeyPress={(e) => {
              if (e.key === "Enter" && formData.achievementInput.trim()) {
                e.preventDefault();
                setFormData({
                  ...formData,
                  achievements: [
                    ...formData.achievements,
                    formData.achievementInput.trim(),
                  ],
                  achievementInput: "",
                });
              }
            }}
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />

          {formData.achievements.length > 0 && (
            <div className="space-y-2">
              {formData.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span>• {achievement}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        achievements: formData.achievements.filter(
                          (_, idx) => idx !== i,
                        ),
                      });
                    }}
                    className="ml-auto text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdateExperience}
              disabled={
                !formData.companyEn ||
                !formData.companyFr ||
                !formData.roleEn ||
                !formData.roleFr ||
                !formData.startDate
              }
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingExperience ? "Update Experience" : "+ Add Experience"}
            </button>
            {editingExperience && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing Experiences List */}
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{exp.company.en}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exp.position.en}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {exp.startDate} -{" "}
                    {exp.current ? "Present" : exp.endDate || "N/A"}
                  </span>
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-foreground hover:opacity-70 transition-opacity p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {exp.description.en}
              </p>
              {exp.description.en?.includes("•") && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {exp.description.en
                    .split("\n")
                    .filter((line) => line.trim().startsWith("•"))
                    .map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                </ul>
              )}
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No experiences found. Add your first experience above.
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
