import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { farmerApi } from '../../services/api';
import { User, CheckCircle2, Save, MapPin, Building, Sprout, Landmark } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';

export const FarmerProfilePage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    village: '',
    district: '',
    state: '',
    address: '',
    preferredLanguage: 'en',
    landAreaAcres: 0,
    primaryCrops: '',
    bankAccountNumber: '',
    bankIfsc: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        village: profile.village || '',
        district: profile.district || '',
        state: profile.state || '',
        address: profile.address || '',
        preferredLanguage: profile.preferredLanguage || 'en',
        landAreaAcres: profile.farmDetails?.landAreaAcres || 0,
        primaryCrops: profile.farmDetails?.primaryCrops?.join(', ') || '',
        bankAccountNumber: profile.farmDetails?.bankAccountNumber || '',
        bankIfsc: profile.farmDetails?.bankIfsc || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      const res = await farmerApi.updateProfile({
        village: formData.village.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        address: formData.address.trim(),
        preferredLanguage: formData.preferredLanguage,
        farmDetails: {
          landAreaAcres: Number(formData.landAreaAcres) || 0,
          primaryCrops: formData.primaryCrops
            ? formData.primaryCrops.split(',').map((c) => c.trim()).filter(Boolean)
            : [],
          bankAccountNumber: formData.bankAccountNumber.trim(),
          bankIfsc: formData.bankIfsc.trim().toUpperCase(),
        },
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully in central registry.');
        await refreshUser();
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Farmer Profile & Bank Settings"
        description="Aadhaar & Bank account details for automated Direct Benefit Transfer (DBT) of Mandi MSP payouts."
        icon={<User size={24} />}
      />

      {successMsg && (
        <div className="p-4 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-[#15803D] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4B5563]">
            Personal & Identification
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Farmer Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-[#1F2937] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                Kisan Registration ID
              </label>
              <input
                type="text"
                value={profile?.farmerId || 'Pending Allocation'}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-[#166534] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4B5563]">
            Farm Address & Location
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">Village</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter village"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4B5563]">
            Aadhaar Linked Bank Account (For Automated MSP Direct Credit)
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                placeholder="Enter bank account number"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                name="bankIfsc"
                value={formData.bankIfsc}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono uppercase text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            icon={<Save size={16} />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
