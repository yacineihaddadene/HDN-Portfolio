'use client';

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/auth-client';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: any;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/dashboard/projects', icon: '💼' },
  { name: 'Skills', href: '/dashboard/skills', icon: '⚡' },
  { name: 'Experience', href: '/dashboard/experience', icon: '🏢' },
  { name: 'Education', href: '/dashboard/education', icon: '🎓' },
  { name: 'Hobbies', href: '/dashboard/hobbies', icon: '🎨' },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: '💬' },
  { name: 'Messages', href: '/dashboard/messages', icon: '📧' },
  { name: 'Contact Info', href: '/dashboard/contact-info', icon: '📞' },
  { name: 'Resume', href: '/dashboard/resume', icon: '📄' },
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-700 p-4">
          {sidebarOpen && user && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Logged in as</p>
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <span>🚪</span>
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Portfolio →
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
