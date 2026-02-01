'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, ContactInfo } from '@/lib/api/client';

export default function ContactInfoPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState<ContactInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session?.data?.session) {
        router.push('/login');
        return;
      }
      setUser(session.data.user);
      await loadContactInfo();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadContactInfo = async () => {
    try {
      const response = await apiClient.getContactInfo();
      setContactInfo(response.contactInfo);
    } catch (error) {
      console.error('Failed to load contact info:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact info?')) return;
    try {
      await apiClient.deleteContactInfo(id);
      await loadContactInfo();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div>Loading...</div></div>;

  const groupedInfo = contactInfo.reduce((acc, info) => {
    if (!acc[info.type]) acc[info.type] = [];
    acc[info.type].push(info);
    return acc;
  }, {} as Record<string, ContactInfo[]>);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <p className="text-gray-600 mt-1">Manage your contact details</p>
          </div>
          <button onClick={() => { setEditingInfo(null); setShowModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">➕ Add Contact Info</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedInfo).map(([type, items]) => (
            <div key={type} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">{type.replace('_', ' ')}</h3>
              <div className="space-y-3">
                {items.map((info) => (
                  <div key={info.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{info.value}</p>
                      <p className="text-xs text-gray-500">Order: {info.order}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingInfo(info); setShowModal(true); }} className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                      <button onClick={() => handleDelete(info.id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {contactInfo.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">No contact information found.</div>
          )}
        </div>
      </div>

      {showModal && <ContactInfoModal info={editingInfo} onClose={() => setShowModal(false)} onSave={async () => { await loadContactInfo(); setShowModal(false); }} />}
    </DashboardLayout>
  );
}

function ContactInfoModal({ info, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    type: info?.type || 'email',
    value: info?.value || '',
    order: info?.order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (info) {
        await apiClient.updateContactInfo(info.id, formData);
      } else {
        await apiClient.createContactInfo(formData);
      }
      onSave();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{info ? 'Edit Contact Info' : 'Create Contact Info'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="address">Address</option>
              <option value="social_links">Social Links</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Value *</label>
            <input type="text" required value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder={formData.type === 'email' ? 'contact@example.com' : formData.type === 'phone' ? '+1234567890' : formData.type === 'address' ? '123 Main St' : 'https://...'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
