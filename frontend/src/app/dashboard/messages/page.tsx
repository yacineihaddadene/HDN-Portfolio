'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, ContactMessage } from '@/lib/api/client';
import { Mail, Trash2, Eye, EyeOff } from 'lucide-react';

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }
      setUser(session.data.user);
      await loadMessages();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadMessages = async (statusFilter?: string) => {
    try {
      const response = await apiClient.getMessages(statusFilter === 'all' ? undefined : statusFilter);
      setMessages(response.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    loadMessages(newFilter);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (status === 'read') {
        await apiClient.markMessageAsRead(id);
      } else {
        await apiClient.markMessageAsUnread(id);
      }
      await loadMessages(filter);
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error: any) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await apiClient.deleteMessage(id);
      await loadMessages(filter);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
            <p className="text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => handleFilterChange('read')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Read
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-gray-950 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-800 max-h-[calc(100vh-250px)] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No messages found
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === 'unread') {
                        handleStatusChange(message.id, 'read');
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-900 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                    } ${message.status === 'unread' ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {message.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {message.status === 'unread' && (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      From: <span className="font-medium text-blue-400">{selectedMessage.name}</span> ({selectedMessage.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'read' ? 'unread' : 'read')}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      {selectedMessage.status === 'read' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {selectedMessage.status === 'read' ? 'Unread' : 'Read'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50"
                  >
                    <Mail className="w-4 h-4" />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg p-12 text-center text-gray-500">
                <p className="text-lg">Select a message to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
