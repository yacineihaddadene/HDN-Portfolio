"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { useConfirmModal, useToast } from "@/hooks/useModals";
import { apiClient, Skill } from "@/lib/api/client";
import { ArrowLeft, Trash2, Edit, Plus } from "lucide-react";
import { SkillIcon } from "@/lib/skillIcons";

export default function SkillsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nameEn: "",
    nameFr: "",
    category: "",
    level: 50,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
        return;
      }
      setUser(session.data.user);
      await loadSkills();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadSkills = async () => {
    try {
      const response = await apiClient.getSkills();
      setSkills(response.skills);
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  };

  const handleAddOrUpdateSkill = async () => {
    try {
      const data: any = {
        name: { en: formData.nameEn, fr: formData.nameEn }, // Use same name for both languages
        category: formData.category,
        level: formData.level,
        order: skills.length,
      };

      if (editingSkill) {
        await apiClient.updateSkill(editingSkill.id, data);
        showToast("Skill updated successfully", "success");
      } else {
        await apiClient.createSkill(data);
        showToast("Skill created successfully", "success");
      }

      await loadSkills();

      // Reset form
      setFormData({
        nameEn: "",
        nameFr: "",
        category: "",
        level: 50,
      });
      setEditingSkill(null);
    } catch (error: any) {
      showToast(`Failed to save skill: ${error.message}`, "error");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      nameEn: skill.name.en,
      nameFr: skill.name.fr,
      category: skill.category,
      level: skill.level || 50,
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setFormData({
      nameEn: "",
      nameFr: "",
      category: "",
      level: 50,
    });
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Delete Skill",
      "Are you sure you want to delete this skill? This action cannot be undone.",
      async () => {
        setIsDeleting(true);
        try {
          await apiClient.deleteSkill(id);
          await loadSkills();
          showToast("Skill deleted successfully", "success");
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
          <h2 className="text-2xl font-bold">Skills</h2>
        </div>

        {/* Add New Skill Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Add New Skill</h3>

          <input
            type="text"
            placeholder="Skill name"
            value={formData.nameEn}
            onChange={(e) =>
              setFormData({ ...formData, nameEn: e.target.value })
            }
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="50"
                value={formData.level === 0 ? "" : formData.level}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    level: isNaN(value) ? 0 : Math.min(100, Math.max(0, value)),
                  });
                }}
                className="w-20 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              <span className="text-sm text-muted-foreground min-w-[3rem]">
                {formData.level}%
              </span>
              <button
                onClick={handleAddOrUpdateSkill}
                disabled={!formData.nameEn || !formData.category}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {editingSkill ? "Update" : "Add"}
              </button>
            </div>
          </div>

          {editingSkill && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Existing Skills List */}
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <SkillIcon skillName={skill.name.en} className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">{skill.name.en}</h3>
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {skill.category}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all"
                        style={{ width: `${skill.level || 50}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                      {skill.level || 50}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="text-foreground hover:opacity-70 transition-opacity p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No skills found. Add your first skill above.
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
