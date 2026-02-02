'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api/client';
import {
  Briefcase,
  Zap,
  Building2,
  GraduationCap,
  Mail,
  MessageSquare,
  Plus,
  Star,
  Inbox,
  FileText
} from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-2 text-white">Welcome back, {user?.email}! 👋</h2>
          <p className="text-gray-400">
            Manage your portfolio content from this dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Projects"
            count={stats.projects}
            icon={Briefcase}
            href="/dashboard/projects"
            color="blue"
          />
          <StatCard
            title="Skills"
            count={stats.skills}
            icon={Zap}
            href="/dashboard/skills"
            color="green"
          />
          <StatCard
            title="Work Experience"
            count={stats.experiences}
            icon={Building2}
            href="/dashboard/experience"
            color="purple"
          />
          <StatCard
            title="Education"
            count={stats.education}
            icon={GraduationCap}
            href="/dashboard/education"
            color="yellow"
          />
          <StatCard
            title="Messages"
            count={stats.messages}
            icon={Mail}
            href="/dashboard/messages"
            color="red"
          />
          <StatCard
            title="Testimonials"
            count={stats.testimonials}
            icon={MessageSquare}
            href="/dashboard/testimonials"
            color="pink"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-black border border-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              label="Add Project"
              icon={Plus}
              href="/dashboard/projects"
            />
            <QuickActionButton
              label="Add Skill"
              icon={Star}
              href="/dashboard/skills"
            />
            <QuickActionButton
              label="View Messages"
              icon={Inbox}
              href="/dashboard/messages"
            />
            <QuickActionButton
              label="Manage Resume"
              icon={FileText}
              href="/dashboard/resume"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, count, icon: Icon, href, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500 hover:shadow-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500 hover:shadow-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500 hover:shadow-purple-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:border-yellow-500 hover:shadow-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500 hover:shadow-red-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:border-pink-500 hover:shadow-pink-500/20',
  };

  return (
    <a
      href={href}
      className={`block p-6 rounded-lg border-2 transition-all hover:shadow-lg transform hover:scale-105 ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={32} />
        <span className="text-3xl font-bold">{count}</span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm opacity-75 mt-1">View all →</p>
    </a>
  );
}

function QuickActionButton({ label, icon: Icon, href }: any) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 border-2 border-gray-900 bg-black rounded-lg hover:border-blue-500 hover:bg-gray-950 transition-all transform hover:scale-105"
    >
      <Icon size={20} className="text-gray-400" />
      <span className="font-medium text-gray-300">{label}</span>
    </a>
  );
}

