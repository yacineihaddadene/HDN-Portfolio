const apiUrl =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    : process.env.API_URL || "http://backend:8080";

interface BilingualField {
  en: string;
  fr: string;
}

export interface About {
  id: string;
  welcomeText: BilingualField;
  mainHeading: BilingualField;
  subtext: BilingualField;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: BilingualField;
  category: string;
  level?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: BilingualField;
  description: BilingualField;
  fullDescription?: BilingualField;
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
  imageUrl?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  position: BilingualField;
  company: BilingualField;
  location: BilingualField;
  description: BilingualField;
  startDate: string;
  endDate?: string;
  current: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  degree: BilingualField;
  institution: BilingualField;
  location: BilingualField;
  description?: BilingualField;
  startDate: string;
  endDate?: string;
  gpa?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Hobby {
  id: string;
  title: BilingualField;
  description?: BilingualField;
  imageUrl?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company?: string;
  email: string;
  message: BilingualField;
  rating: number;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  filename: string;
  fileUrl: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  type: string;
  value: BilingualField;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiClient {
  private baseUrl: string;
  private authServiceUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.baseUrl = apiUrl;
    this.authServiceUrl =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001"
        : process.env.AUTH_SERVICE_URL || "http://auth-service:3001";
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;

    // Check if we have a valid cached token
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    try {
      // Get JWT token from auth service
      const response = await fetch(`${this.authServiceUrl}/api/auth/token`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to get auth token:", response.status);
        this.cachedToken = null;
        this.tokenExpiry = null;
        return null;
      }

      const data = await response.json();

      if (data.token) {
        this.cachedToken = data.token;
        // Cache for 55 minutes (token expires in 1 hour)
        this.tokenExpiry = Date.now() + 55 * 60 * 1000;
        return data.token;
      }

      return null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      this.cachedToken = null;
      this.tokenExpiry = null;
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token for admin endpoints
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add any custom headers from options
    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.assign(headers, customHeaders);
    }

    // Add Authorization header if token exists and it's an admin endpoint
    if (token && endpoint.includes("/admin/")) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));

      // If unauthorized, clear cached token and retry once
      if (response.status === 401 && this.cachedToken) {
        this.cachedToken = null;
        this.tokenExpiry = null;

        // Retry with fresh token
        const newToken = await this.getAuthToken();
        if (newToken && endpoint.includes("/admin/")) {
          headers["Authorization"] = `Bearer ${newToken}`;

          const retryResponse = await fetch(url, {
            ...options,
            credentials: "include",
            headers,
          });

          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      }

      throw new Error(error.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ============ SKILLS ============
  async getSkills() {
    return this.request<{ skills: Skill[] }>("/api/admin/skills");
  }

  async createSkill(data: Partial<Skill>) {
    return this.request<{ skill: Skill }>("/api/admin/skills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSkill(id: string, data: Partial<Skill>) {
    return this.request<{ skill: Skill }>(`/api/admin/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSkill(id: string) {
    return this.request<{ message: string }>(`/api/admin/skills/${id}`, {
      method: "DELETE",
    });
  }

  // ============ PROJECTS ============
  async getProjects() {
    return this.request<{ projects: Project[] }>("/api/admin/projects");
  }

  async getProject(id: string) {
    return this.request<{ project: Project }>(`/api/admin/projects/${id}`);
  }

  async createProject(data: Partial<Project>) {
    return this.request<{ project: Project }>("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.request<{ project: Project }>(`/api/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ message: string }>(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });
  }

  async uploadProjectImage(
    file: File,
  ): Promise<{ filename: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    // Get auth token for admin endpoint
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {};

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/admin/projects/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }

  // ============ EXPERIENCE ============
  async getExperiences() {
    return this.request<{ experiences: WorkExperience[] }>(
      "/api/admin/experience",
    );
  }

  async getExperience(id: string) {
    return this.request<{ experience: WorkExperience }>(
      `/api/admin/experience/${id}`,
    );
  }

  async createExperience(data: Partial<WorkExperience>) {
    return this.request<{ experience: WorkExperience }>(
      "/api/admin/experience",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async updateExperience(id: string, data: Partial<WorkExperience>) {
    return this.request<{ experience: WorkExperience }>(
      `/api/admin/experience/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  }

  async deleteExperience(id: string) {
    return this.request<{ message: string }>(`/api/admin/experience/${id}`, {
      method: "DELETE",
    });
  }

  // ============ EDUCATION ============
  async getEducation() {
    return this.request<{ education: Education[] }>("/api/admin/education");
  }

  async getEducationItem(id: string) {
    return this.request<{ education: Education }>(`/api/admin/education/${id}`);
  }

  async createEducation(data: Partial<Education>) {
    return this.request<{ education: Education }>("/api/admin/education", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEducation(id: string, data: Partial<Education>) {
    return this.request<{ education: Education }>(
      `/api/admin/education/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  }

  async deleteEducation(id: string) {
    return this.request<{ message: string }>(`/api/admin/education/${id}`, {
      method: "DELETE",
    });
  }

  // ============ HOBBIES ============
  async getHobbies() {
    return this.request<{ hobbies: Hobby[] }>("/api/admin/hobbies");
  }

  async getHobby(id: string) {
    return this.request<{ hobby: Hobby }>(`/api/admin/hobbies/${id}`);
  }

  async createHobby(data: Partial<Hobby>) {
    return this.request<{ hobby: Hobby }>("/api/admin/hobbies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateHobby(id: string, data: Partial<Hobby>) {
    return this.request<{ hobby: Hobby }>(`/api/admin/hobbies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHobby(id: string) {
    return this.request<{ message: string }>(`/api/admin/hobbies/${id}`, {
      method: "DELETE",
    });
  }

  async uploadHobbyImage(
    file: File,
  ): Promise<{ filename: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    // Get auth token for admin endpoint
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {};

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/admin/hobbies/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }

  // ============ TESTIMONIALS ============
  async getTestimonials(status?: string) {
    const query = status ? `?status=${status}` : "";
    return this.request<{ testimonials: Testimonial[] }>(
      `/api/admin/testimonials${query}`,
    );
  }

  async approveTestimonial(id: string) {
    return this.request<{ testimonial: Testimonial }>(
      `/api/admin/testimonials/${id}/approve`,
      {
        method: "PUT",
      },
    );
  }

  async rejectTestimonial(id: string) {
    return this.request<{ testimonial: Testimonial }>(
      `/api/admin/testimonials/${id}/reject`,
      {
        method: "PUT",
      },
    );
  }

  async deleteTestimonial(id: string) {
    return this.request<{ message: string }>(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
    });
  }

  // ============ MESSAGES ============
  async getMessages(status?: string) {
    const query = status ? `?status=${status}` : "";
    return this.request<{ messages: ContactMessage[] }>(
      `/api/admin/messages${query}`,
    );
  }

  async markMessageAsRead(id: string) {
    return this.request<{ message: ContactMessage }>(
      `/api/admin/messages/${id}/read`,
      {
        method: "PUT",
      },
    );
  }

  async markMessageAsUnread(id: string) {
    return this.request<{ message: ContactMessage }>(
      `/api/admin/messages/${id}/unread`,
      {
        method: "PUT",
      },
    );
  }

  async deleteMessage(id: string) {
    return this.request<{ message: string }>(`/api/admin/messages/${id}`, {
      method: "DELETE",
    });
  }

  // ============ CONTACT INFO ============
  async getContactInfo() {
    return this.request<{ contactInfo: ContactInfo[] }>(
      "/api/admin/contact-info",
    );
  }

  async createContactInfo(data: Partial<ContactInfo>) {
    return this.request<{ contactInfo: ContactInfo }>(
      "/api/admin/contact-info",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async updateContactInfo(id: string, data: Partial<ContactInfo>) {
    return this.request<{ contactInfo: ContactInfo }>(
      `/api/admin/contact-info/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  }

  async deleteContactInfo(id: string) {
    return this.request<{ message: string }>(`/api/admin/contact-info/${id}`, {
      method: "DELETE",
    });
  }

  // ============ RESUME ============
  async getResumes() {
    return this.request<{ resumes: Resume[] }>("/api/admin/resume");
  }

  async uploadResumeFile(
    file: File,
  ): Promise<{ filename: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    // Get auth token for admin endpoint
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {};

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/admin/resume/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }

  async createResume(data: Partial<Resume>) {
    return this.request<{ resume: Resume }>("/api/admin/resume", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateResume(id: string, data: Partial<Resume>) {
    return this.request<{ resume: Resume }>(`/api/admin/resume/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteResume(id: string) {
    return this.request<{ message: string }>(`/api/admin/resume/${id}`, {
      method: "DELETE",
    });
  }

  // Public endpoints (for frontend portfolio display)
  async getPublicSkills() {
    return this.request<{ skills: Skill[] }>("/api/public/skills");
  }

  async getPublicProjects() {
    return this.request<{ projects: Project[] }>("/api/public/projects");
  }

  async getPublicExperience() {
    return this.request<{ experiences: WorkExperience[] }>(
      "/api/public/experience",
    );
  }

  async getPublicEducation() {
    return this.request<{ education: Education[] }>("/api/public/education");
  }

  async getPublicHobbies() {
    return this.request<{ hobbies: Hobby[] }>("/api/public/hobbies");
  }

  async getPublicTestimonials() {
    return this.request<{ testimonials: Testimonial[] }>(
      "/api/public/testimonials",
    );
  }

  async getPublicResume(lang: "en" | "fr" = "en") {
    return this.request<{ resume: Resume }>(`/api/public/resume?lang=${lang}`);
  }

  async getPublicContactInfo() {
    return this.request<{ contactInfo: ContactInfo[] }>(
      "/api/public/contact-info",
    );
  }

  async sendMessage(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    return this.request("/api/public/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitTestimonial(data: {
    name: string;
    position: string;
    company?: string;
    email: string;
    message: { en: string; fr: string } | string;
    rating: number;
  }) {
    return this.request("/api/public/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============ ABOUT ============
  async getAbout() {
    return this.request<{ about: About }>("/api/admin/about");
  }

  async updateAbout(data: Partial<About>) {
    return this.request<{ about: About }>("/api/admin/about", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getPublicAbout() {
    return this.request<{ about: About }>("/api/public/about");
  }
}

export const apiClient = new ApiClient();
