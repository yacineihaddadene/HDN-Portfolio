'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, ContactMessage } from '@/lib/api/client';

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
      await apiClient.updateMessageStatus(id, status);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Contact Messages</h2>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => handleFilterChange('read')}
              className={`px-4 py-2 rounded-lg ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Read
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
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
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${message.status === 'unread' ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {message.status === 'unread' && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
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
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      From: <span className="font-medium">{selectedMessage.name}</span> ({selectedMessage.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'read' ? 'unread' : 'read')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Mark as {selectedMessage.status === 'read' ? 'Unread' : 'Read'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    📧 Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <p className="text-lg">Select a message to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
