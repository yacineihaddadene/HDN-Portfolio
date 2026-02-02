'use client';

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/auth-client';
import {
  LayoutDashboard,
  Briefcase,
  Zap,
  Building2,
  GraduationCap,
  Palette,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: any;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Skills', href: '/dashboard/skills', icon: Zap },
  { name: 'Experience', href: '/dashboard/experience', icon: Building2 },
  { name: 'Education', href: '/dashboard/education', icon: GraduationCap },
  { name: 'Hobbies', href: '/dashboard/hobbies', icon: Palette },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquare },
  { name: 'Messages', href: '/dashboard/messages', icon: Mail },
  { name: 'Contact Info', href: '/dashboard/contact-info', icon: Phone },
  { name: 'Resume', href: '/dashboard/resume', icon: FileText },
];

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-black border-r border-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-900">
          {sidebarOpen && <h1 className="text-xl font-bold text-white">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-900 transition-colors text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                        : 'hover:bg-gray-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-900 p-4">
          {sidebarOpen && user && (
            <div className="mb-3 p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-gray-500" />
                <p className="text-xs text-gray-500">Logged in as</p>
              </div>
              <p className="text-sm font-medium truncate text-white">{user.email}</p>
              <p className="text-xs text-blue-400 capitalize mt-1">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 hover:text-red-300"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-black border-b border-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white font-medium transition-colors border border-gray-900 rounded-lg hover:border-gray-800 hover:bg-gray-900"
              >
                <ExternalLink size={16} />
                View Portfolio
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-black">{children}</main>
      </div>
    </div>
  );
}
