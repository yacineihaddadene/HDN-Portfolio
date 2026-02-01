'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api/client';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experiences: 0,
    education: 0,
    messages: 0,
    testimonials: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }

      setUser(session.data.user);
      loadStats();
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadStats = async () => {
    try {
      const [projects, skills, experiences, education, messages, testimonials] = await Promise.all([
        apiClient.getProjects().catch((err) => {
          console.error('Failed to load projects:', err);
          return { projects: [] };
        }),
        apiClient.getSkills().catch((err) => {
          console.error('Failed to load skills:', err);
          return { skills: [] };
        }),
        apiClient.getExperiences().catch((err) => {
          console.error('Failed to load experiences:', err);
          return { experiences: [] };
        }),
        apiClient.getEducation().catch((err) => {
          console.error('Failed to load education:', err);
          return { education: [] };
        }),
        apiClient.getMessages().catch((err) => {
          console.error('Failed to load messages:', err);
          return { messages: [] };
        }),
        apiClient.getTestimonials().catch((err) => {
          console.error('Failed to load testimonials:', err);
          return { testimonials: [] };
        }),
      ]);

      setStats({
        projects: projects.projects.length,
        skills: skills.skills.length,
        experiences: experiences.experiences.length,
        education: education.education.length,
        messages: messages.messages.length,
        testimonials: testimonials.testimonials.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
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
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.email}! 👋</h2>
          <p className="text-gray-600">
            Manage your portfolio content from this dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Projects"
            count={stats.projects}
            icon="💼"
            href="/dashboard/projects"
            color="blue"
          />
          <StatCard
            title="Skills"
            count={stats.skills}
            icon="⚡"
            href="/dashboard/skills"
            color="green"
          />
          <StatCard
            title="Work Experience"
            count={stats.experiences}
            icon="🏢"
            href="/dashboard/experience"
            color="purple"
          />
          <StatCard
            title="Education"
            count={stats.education}
            icon="🎓"
            href="/dashboard/education"
            color="yellow"
          />
          <StatCard
            title="Messages"
            count={stats.messages}
            icon="📧"
            href="/dashboard/messages"
            color="red"
          />
          <StatCard
            title="Testimonials"
            count={stats.testimonials}
            icon="💬"
            href="/dashboard/testimonials"
            color="pink"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              label="Add Project"
              icon="➕"
              href="/dashboard/projects"
            />
            <QuickActionButton
              label="Add Skill"
              icon="⭐"
              href="/dashboard/skills"
            />
            <QuickActionButton
              label="View Messages"
              icon="📬"
              href="/dashboard/messages"
            />
            <QuickActionButton
              label="Manage Resume"
              icon="📄"
              href="/dashboard/resume"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, count, icon, href, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
  };

  return (
    <a
      href={href}
      className={`block p-6 rounded-lg border-2 transition-all hover:shadow-lg ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold">{count}</span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm opacity-75 mt-1">View all →</p>
    </a>
  );
}

function QuickActionButton({ label, icon, href }: any) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
    </a>
  );
}

