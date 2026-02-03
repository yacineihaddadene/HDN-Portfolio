"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useModals";
import { apiClient, ContactInfo } from "@/lib/api/client";
import { ArrowLeft } from "lucide-react";

export default function ContactInfoPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    twitter: "",
    website: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push("/login");
        return;
      }
      setUser(session.data.user);
      await loadContactInfo();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadContactInfo = async () => {
    try {
      const response = await apiClient.getContactInfo();
      if (response.contactInfo && response.contactInfo.length > 0) {
        // Initialize form data
        const newFormData = {
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          twitter: "",
          website: "",
        };

        // Parse all contact info entries
        response.contactInfo.forEach((info) => {
          const getValue = (val: any) => {
            if (typeof val === "object" && val !== null) {
              return val.en || val.fr || "";
            }
            return val || "";
          };

          const value = getValue(info.value);

          switch (info.type) {
            case "email":
              newFormData.email = value;
              break;
            case "phone":
              newFormData.phone = value;
              break;
            case "address":
              newFormData.location = value;
              break;
            case "social_links":
              // Determine which social link it is based on URL
              if (value.toLowerCase().includes("linkedin")) {
                newFormData.linkedin = value;
              } else if (value.toLowerCase().includes("github")) {
                newFormData.github = value;
              } else if (
                value.toLowerCase().includes("twitter") ||
                value.toLowerCase().includes("x.com")
              ) {
                newFormData.twitter = value;
              } else {
                // If we can't determine, put it in website
                if (!newFormData.website) {
                  newFormData.website = value;
                }
              }
              break;
          }
        });

        setFormData(newFormData);
        setContactInfo(response.contactInfo[0] || null);
      }
    } catch (error) {
      console.error("Failed to load contact info:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Delete all existing contact info first
      const existingContacts = await apiClient.getContactInfo();
      for (const contact of existingContacts.contactInfo) {
        await apiClient.deleteContactInfo(contact.id);
      }

      // Create new contact info entries
      let order = 0;

      if (formData.email) {
        await apiClient.createContactInfo({
          type: "email",
          value: { en: formData.email, fr: formData.email },
          order: order++,
        });
      }

      if (formData.phone) {
        await apiClient.createContactInfo({
          type: "phone",
          value: { en: formData.phone, fr: formData.phone },
          order: order++,
        });
      }

      if (formData.location) {
        await apiClient.createContactInfo({
          type: "address",
          value: { en: formData.location, fr: formData.location },
          order: order++,
        });
      }

      if (formData.linkedin) {
        await apiClient.createContactInfo({
          type: "social_links",
          value: { en: formData.linkedin, fr: formData.linkedin },
          order: order++,
        });
      }

      if (formData.github) {
        await apiClient.createContactInfo({
          type: "social_links",
          value: { en: formData.github, fr: formData.github },
          order: order++,
        });
      }

      if (formData.twitter) {
        await apiClient.createContactInfo({
          type: "social_links",
          value: { en: formData.twitter, fr: formData.twitter },
          order: order++,
        });
      }

      if (formData.website) {
        await apiClient.createContactInfo({
          type: "social_links",
          value: { en: formData.website, fr: formData.website },
          order: order++,
        });
      }

      await loadContactInfo();
      showToast("Contact information updated successfully", "success");
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Contact</h2>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="hello@yourname.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone (optional)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              placeholder="New York, NY"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              placeholder="#"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub URL</label>
            <input
              type="url"
              placeholder="#"
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Twitter URL
            </label>
            <input
              type="url"
              placeholder="#"
              value={formData.twitter}
              onChange={(e) =>
                setFormData({ ...formData, twitter: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              type="url"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            💾 Save Changes
          </button>
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
