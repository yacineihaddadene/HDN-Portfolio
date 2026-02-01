'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, Testimonial } from '@/lib/api/client';

export default function TestimonialsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }
      setUser(session.data.user);
      await loadTestimonials();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadTestimonials = async (statusFilter?: string) => {
    try {
      const response = await apiClient.getTestimonials(statusFilter === 'all' ? undefined : statusFilter);
      setTestimonials(response.testimonials);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    loadTestimonials(newFilter);
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.approveTestimonial(id);
      await loadTestimonials(filter);
    } catch (error: any) {
      alert(`Failed to approve: ${error.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.rejectTestimonial(id);
      await loadTestimonials(filter);
    } catch (error: any) {
      alert(`Failed to reject: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await apiClient.deleteTestimonial(id);
      await loadTestimonials(filter);
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const pendingCount = testimonials.filter(t => t.status === 'pending').length;

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
            <h2 className="text-2xl font-bold">Testimonials</h2>
            <p className="text-gray-600 mt-1">
              {pendingCount > 0 ? `${pendingCount} testimonial${pendingCount > 1 ? 's' : ''} pending review` : 'All testimonials reviewed'}
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
              onClick={() => handleFilterChange('pending')}
              className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              onClick={() => handleFilterChange('approved')}
              className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Approved
            </button>
            <button
              onClick={() => handleFilterChange('rejected')}
              className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                    {testimonial.company && (
                      <p className="text-xs text-gray-500">{testimonial.company}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  testimonial.status === 'approved' ? 'bg-green-100 text-green-800' :
                  testimonial.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {testimonial.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ⭐
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                </div>
                <p className="text-gray-700 text-sm">{testimonial.message}</p>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <p>Email: {testimonial.email}</p>
                <p>Submitted: {new Date(testimonial.submittedAt).toLocaleDateString()}</p>
                {testimonial.reviewedAt && (
                  <p>Reviewed: {new Date(testimonial.reviewedAt).toLocaleDateString()}</p>
                )}
              </div>

              <div className="flex gap-2">
                {testimonial.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(testimonial.id)}
                    className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✓ Approve
                  </button>
                )}
                {testimonial.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(testimonial.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ✗ Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No testimonials found
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
