"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Briefcase,
  Zap,
  Building2,
  GraduationCap,
  Mail,
  MessageSquare,
  Plus,
  Inbox,
  FileText,
  TrendingUp,
} from "lucide-react";

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
        router.push("/login");
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
      const [projects, skills, experiences, education, messages, testimonials] =
        await Promise.all([
          apiClient.getProjects().catch((err) => {
            console.error("Failed to load projects:", err);
            return { projects: [] };
          }),
          apiClient.getSkills().catch((err) => {
            console.error("Failed to load skills:", err);
            return { skills: [] };
          }),
          apiClient.getExperiences().catch((err) => {
            console.error("Failed to load experiences:", err);
            return { experiences: [] };
          }),
          apiClient.getEducation().catch((err) => {
            console.error("Failed to load education:", err);
            return { education: [] };
          }),
          apiClient.getMessages().catch((err) => {
            console.error("Failed to load messages:", err);
            return { messages: [] };
          }),
          apiClient.getTestimonials().catch((err) => {
            console.error("Failed to load testimonials:", err);
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
      console.error("Failed to load stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-foreground border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl p-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground font-display mb-2">
                Welcome back! 👋
              </h2>
              <p className="text-muted-foreground mb-4">
                Manage your portfolio content from this dashboard.
              </p>
              <div className="text-sm text-muted-foreground">
                Logged in as:{" "}
                <span className="font-mono text-foreground">{user?.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                All Systems Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Projects"
            count={stats.projects}
            icon={Briefcase}
            href="/dashboard/projects"
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Skills"
            count={stats.skills}
            icon={Zap}
            href="/dashboard/skills"
            color="green"
            delay={0.2}
          />
          <StatCard
            title="Work Experience"
            count={stats.experiences}
            icon={Building2}
            href="/dashboard/experience"
            color="purple"
            delay={0.3}
          />
          <StatCard
            title="Education"
            count={stats.education}
            icon={GraduationCap}
            href="/dashboard/education"
            color="yellow"
            delay={0.4}
          />
          <StatCard
            title="Messages"
            count={stats.messages}
            icon={Mail}
            href="/dashboard/messages"
            color="red"
            delay={0.5}
          />
          <StatCard
            title="Testimonials"
            count={stats.testimonials}
            icon={MessageSquare}
            href="/dashboard/testimonials"
            color="pink"
            delay={0.6}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-foreground font-display">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickActionButton
              label="Add Project"
              icon={Plus}
              href="/dashboard/projects"
            />
            <QuickActionButton
              label="Add Skill"
              icon={Plus}
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
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, count, icon: Icon, href, color, delay }: any) {
  const colorClasses = {
    blue: "border-blue-500/20 hover:border-blue-500/50",
    green: "border-green-500/20 hover:border-green-500/50",
    purple: "border-purple-500/20 hover:border-purple-500/50",
    yellow: "border-yellow-500/20 hover:border-yellow-500/50",
    red: "border-red-500/20 hover:border-red-500/50",
    pink: "border-pink-500/20 hover:border-pink-500/50",
  };

  const iconColorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
    pink: "text-pink-500",
  };

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2 }}
      className={`block p-6 rounded-xl border-2 bg-card transition-all cursor-pointer ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2 bg-background rounded-lg ${iconColorClasses[color as keyof typeof iconColorClasses]}`}
        >
          <Icon size={20} />
        </div>
        <span className="text-4xl font-bold text-foreground font-display">
          {count}
        </span>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <span>View all</span>
        <span>→</span>
      </div>
    </motion.a>
  );
}

function QuickActionButton({ label, icon: Icon, href }: any) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-4 border border-border bg-card rounded-lg hover:border-foreground/20 hover:bg-muted/50 transition-all group cursor-pointer"
    >
      <div className="p-2 bg-foreground/5 rounded-lg group-hover:bg-foreground/10 transition-colors">
        <Icon
          size={18}
          className="text-muted-foreground group-hover:text-foreground transition-colors"
        />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </motion.a>
  );
}
