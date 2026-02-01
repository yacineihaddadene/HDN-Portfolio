const apiUrl = 
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    : process.env.API_URL || 'http://backend:8080';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Public endpoints
  async getSkills() {
    return this.request('/api/public/skills');
  }

  async getProjects() {
    return this.request('/api/public/projects');
  }

  async getExperience() {
    return this.request('/api/public/experience');
  }

  async getEducation() {
    return this.request('/api/public/education');
  }

  async getHobbies() {
    return this.request('/api/public/hobbies');
  }

  async getTestimonials() {
    return this.request('/api/public/testimonials');
  }

  async getResume() {
    return this.request('/api/public/resume');
  }

  async getContactInfo() {
    return this.request('/api/public/contact-info');
  }

  async sendMessage(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    return this.request('/api/public/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Protected endpoints (require JWT token)
  async getProtectedData(token: string) {
    return this.request('/api/protected/example', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Admin endpoints
  async getAdminMessages(token: string) {
    return this.request('/api/admin/messages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient();
