'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient, ContactInfo } from '@/lib/api/client';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Share2 } from 'lucide-react';

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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-white">Loading...</div></div>;

  const groupedInfo = contactInfo.reduce((acc, info) => {
    if (!acc[info.type]) acc[info.type] = [];
    acc[info.type].push(info);
    return acc;
  }, {} as Record<string, ContactInfo[]>);

  const getIcon = (type: string) => {
    switch(type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'address': return <MapPin className="w-5 h-5" />;
      case 'social_links': return <Share2 className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
            <p className="text-gray-400 mt-1">Manage your contact details</p>
          </div>
          <button onClick={() => { setEditingInfo(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-500/50">
            <Plus className="w-4 h-4" />
            Add Contact Info
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedInfo).map(([type, items]) => (
            <div key={type} className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-blue-400">{getIcon(type)}</div>
                <h3 className="text-lg font-semibold text-white capitalize">{type.replace('_', ' ')}</h3>
              </div>
              <div className="space-y-3">
                {items.map((info) => (
                  <div key={info.id} className="flex justify-between items-center p-3 bg-black border border-gray-800 rounded">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{info.value}</p>
                      <p className="text-xs text-gray-500">Order: {info.order}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingInfo(info); setShowModal(true); }} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(info.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition-colors">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-white">{info ? 'Edit Contact Info' : 'Create Contact Info'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="address">Address</option>
              <option value="social_links">Social Links</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Value *</label>
            <input type="text" required value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={formData.type === 'email' ? 'contact@example.com' : formData.type === 'phone' ? '+1234567890' : formData.type === 'address' ? '123 Main St' : 'https://...'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Order</label>
            <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2 border border-gray-800 text-gray-300 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
