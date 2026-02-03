"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useModals";
import { apiClient, Resume } from "@/lib/api/client";
import { ArrowLeft, Download, Trash2, Eye, Upload } from "lucide-react";

export default function ResumePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [fileUrl, setFileUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
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
      console.error("Failed to load resumes:", error);
    }
  };

  const handleUpload = async () => {
    try {
      if (uploadMode === "url" && fileUrl) {
        await apiClient.createResume({ fileUrl, language, isActive: false });
        showToast("Resume URL added successfully", "success");
        setFileUrl("");
        setShowUploadForm(false);
        await loadResumes();
      } else if (uploadMode === "file" && selectedFile) {
        // In a real scenario, you'd upload the file to a storage service first
        showToast("File upload not yet implemented", "warning");
      }
    } catch (error: any) {
      showToast(`Failed to upload: ${error.message}`, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await apiClient.deleteResume(id);
        await loadResumes();
        showToast("Resume deleted successfully", "success");
      } catch (error: any) {
        showToast(`Failed to delete: ${error.message}`, "error");
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiClient.updateResume(id, { isActive: !isActive });
      await loadResumes();
      showToast(
        `Resume ${!isActive ? "activated" : "deactivated"} successfully`,
        "success",
      );
    } catch (error: any) {
      showToast(`Failed to update: ${error.message}`, "error");
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
            <h2 className="text-2xl font-bold">Resume Management</h2>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            {showUploadForm ? "Cancel" : "+ Add Resume"}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="border rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Method
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setUploadMode("url")}
                  className={`px-4 py-2 rounded-lg ${uploadMode === "url" ? "bg-foreground text-background" : "border"}`}
                >
                  URL
                </button>
                <button
                  onClick={() => setUploadMode("file")}
                  className={`px-4 py-2 rounded-lg ${uploadMode === "file" ? "bg-foreground text-background" : "border"}`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  File
                </button>
              </div>
            </div>

            {uploadMode === "url" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resume URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/resume.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            )}

            {uploadMode === "file" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>

            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              Upload Resume
            </button>
          </div>
        )}

        {/* Resume List */}
        <div className="space-y-4">
          {resumes.length === 0 ? (
            <div className="border rounded-lg p-12 text-center text-muted-foreground">
              No resumes found. Add your first resume above.
            </div>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className={`border rounded-lg p-4 ${resume.isActive ? "border-foreground/50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {resume.filename || "Resume"}
                      </h3>
                      {resume.isActive && (
                        <span className="px-2 py-1 text-xs border rounded">
                          Active
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs border rounded">
                        {resume.language === "fr" ? "French" : "English"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="View Resume"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={resume.fileUrl}
                      download
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() =>
                        handleToggleActive(resume.id, resume.isActive)
                      }
                      className="px-3 py-1 text-sm border rounded-lg hover:bg-muted transition-colors"
                    >
                      {resume.isActive ? "Deactivate" : "Set Active"}
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
