"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { motion } from "framer-motion";
import {
  User,
  Code,
  FolderOpen,
  Briefcase,
  GraduationCap,
  Heart,
  Mail,
  LogOut,
  Eye,
  FileText,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: any;
}

const navigation = [
  { name: "Profile", href: "/dashboard", icon: User },
  { name: "Skills", href: "/dashboard/skills", icon: Code },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Experience", href: "/dashboard/experience", icon: Briefcase },
  { name: "Education", href: "/dashboard/education", icon: GraduationCap },
  { name: "Hobbies", href: "/dashboard/hobbies", icon: Heart },
  { name: "Contact", href: "/dashboard/contact-info", icon: Mail },
  {
    name: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageCircle,
  },
  { name: "Manage Resume", href: "/dashboard/resume", icon: FileText },
  { name: "View Messages", href: "/dashboard/messages", icon: MessageSquare },
];

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="admin-theme flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-card border-r border-border flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your portfolio
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-all font-medium w-full"
          >
            <Eye className="w-5 h-5" />
            <span>View Portfolio</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all font-medium w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
