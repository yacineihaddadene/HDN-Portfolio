"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useModals";
import { apiClient, About } from "@/lib/api/client";
import { ArrowLeft, Save } from "lucide-react";

export default function AboutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    welcomeTextEn: "",
    welcomeTextFr: "",
    mainHeadingEn: "",
    mainHeadingFr: "",
    subtextEn: "",
    subtextFr: "",
  });

  const loadAbout = useCallback(async () => {
    try {
      const response = await apiClient.getAbout();
      if (response.about) {
        setFormData({
          welcomeTextEn: response.about.welcomeText.en,
          welcomeTextFr: response.about.welcomeText.fr,
          mainHeadingEn: response.about.mainHeading.en,
          mainHeadingFr: response.about.mainHeading.fr,
          subtextEn: response.about.subtext.en,
          subtextFr: response.about.subtext.fr,
        });
      }
    } catch (error) {
      console.error("Failed to load about data:", error);
      showToast("Failed to load about data", "error");
    }
  }, [showToast]);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
        return;
      }
      setUser(session.data.user);
      await loadAbout();
      setLoading(false);
    };
    checkAuth();
  }, [router, loadAbout]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateAbout({
        welcomeText: { en: formData.welcomeTextEn, fr: formData.welcomeTextFr },
        mainHeading: { en: formData.mainHeadingEn, fr: formData.mainHeadingFr },
        subtext: { en: formData.subtextEn, fr: formData.subtextFr },
      });
      showToast("About section updated successfully", "success");
      await loadAbout();
    } catch (error: any) {
      showToast(`Failed to update: ${error.message}`, "error");
    } finally {
      setSaving(false);
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
        {/* Header with Back Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">About Section</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Form */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="text-sm text-accent mb-4">
                {formData.welcomeTextEn || "WELCOME TEXT"}
              </p>
              <h1 className="text-3xl font-bold mb-4">
                {formData.mainHeadingEn || "Main Heading"}
              </h1>
              <p className="text-muted-foreground">
                {formData.subtextEn || "Subtext description"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Version */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                English Version
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Welcome Text (Small Text at Top)
                </label>
                <input
                  type="text"
                  value={formData.welcomeTextEn}
                  onChange={(e) =>
                    setFormData({ ...formData, welcomeTextEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="WELCOME TO MY PORTFOLIO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Main Heading (Large Hero Text)
                </label>
                <textarea
                  rows={3}
                  value={formData.mainHeadingEn}
                  onChange={(e) =>
                    setFormData({ ...formData, mainHeadingEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="I craft digital experiences that resonate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subtext (Description Below)
                </label>
                <textarea
                  rows={2}
                  value={formData.subtextEn}
                  onChange={(e) =>
                    setFormData({ ...formData, subtextEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Explore my work, skills, and professional journey"
                />
              </div>
            </div>

            {/* French Version */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Version Française
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Texte de Bienvenue
                </label>
                <input
                  type="text"
                  value={formData.welcomeTextFr}
                  onChange={(e) =>
                    setFormData({ ...formData, welcomeTextFr: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="BIENVENUE SUR MON PORTFOLIO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Titre Principal
                </label>
                <textarea
                  rows={3}
                  value={formData.mainHeadingFr}
                  onChange={(e) =>
                    setFormData({ ...formData, mainHeadingFr: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Je crée des expériences numériques qui résonnent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sous-texte
                </label>
                <textarea
                  rows={2}
                  value={formData.subtextFr}
                  onChange={(e) =>
                    setFormData({ ...formData, subtextFr: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Découvrez mon travail, mes compétences et mon parcours professionnel"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
}
