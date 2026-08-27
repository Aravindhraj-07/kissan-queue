import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { centresApi } from '../../services/api';
import { IProcurementCentre } from '../../types';
import { Building2, Plus, Phone, Inbox, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const CentreManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [centres, setCentres] = useState<IProcurementCentre[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCentre, setNewCentre] = useState({
    name: '',
    centreCode: '',
    district: '',
    state: '',
    address: '',
    pincode: '',
    lat: 0,
    lng: 0,
    capacityPerDay: 500,
    contactPhone: '',
  });
  const [message, setMessage] = useState('');

  const fetchCentres = async () => {
    try {
      const res = await centresApi.getCentres();
      if (res.data.success) {
        setCentres(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load centres:', err);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const handleCreateCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await centresApi.createCentre(newCentre);
      if (res.data.success) {
        setMessage('Procurement centre added successfully.');
        setIsAdding(false);
        setNewCentre({
          name: '',
          centreCode: '',
          district: '',
          state: '',
          address: '',
          pincode: '',
          lat: 0,
          lng: 0,
          capacityPerDay: 500,
          contactPhone: '',
        });
        fetchCentres();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create centre.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title={t('admin.manageCentres')}
        description="Manage physical Mandi yards, GPS coordinates, daily limits, and assigned staff."
        icon={<Building2 size={24} />}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAdding(!isAdding)}
            icon={<Plus size={16} />}
          >
            Add New Mandi
          </Button>
        }
      />

      {message && (
        <div className="p-4 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-[#15803D] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleCreateCentre} className="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200/90 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
            Register New Mandi Yard
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-[#1F2937] mb-1">Mandi Name *</label>
              <input
                type="text"
                value={newCentre.name}
                onChange={(e) => setNewCentre({ ...newCentre, name: e.target.value })}
                placeholder="e.g. Panipat Grain Market"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#1F2937] mb-1">Centre Code *</label>
              <input
                type="text"
                value={newCentre.centreCode}
                onChange={(e) => setNewCentre({ ...newCentre, centreCode: e.target.value.toUpperCase() })}
                placeholder="e.g. PC-PNP-04"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 uppercase font-mono text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#1F2937] mb-1">{t('auth.district')} *</label>
              <input
                type="text"
                value={newCentre.district}
                onChange={(e) => setNewCentre({ ...newCentre, district: e.target.value })}
                placeholder="e.g. Panipat"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#1F2937] mb-1">{t('auth.state')} *</label>
              <input
                type="text"
                value={newCentre.state}
                onChange={(e) => setNewCentre({ ...newCentre, state: e.target.value })}
                placeholder="e.g. Haryana"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#1F2937] mb-1">Full Yard Address</label>
              <input
                type="text"
                value={newCentre.address}
                onChange={(e) => setNewCentre({ ...newCentre, address: e.target.value })}
                placeholder="e.g. Main GT Road, Grain Market Yard Complex"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      )}

      {/* Centres List */}
      {centres.length === 0 ? (
        <EmptyState
          icon={<Building2 size={24} />}
          title={t('empty.noCentres')}
          description="Register your first Mandi yard by clicking 'Add New Mandi' above."
          actionText="Add New Mandi"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {centres.map((c) => (
            <div key={c._id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[#166534] text-xs bg-[#DCFCE7] px-2.5 py-1 rounded-md border border-[#86EFAC]">
                    {c.centreCode}
                  </span>
                  <Badge status={c.status} size="sm" />
                </div>

                <h3 className="font-extrabold text-[#1F2937] text-base">{c.name}</h3>
                <p className="text-xs text-[#4B5563]">{c.address}</p>

                <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs sm:text-sm text-[#1F2937]">
                  <div>
                    <span className="text-[#4B5563] block text-xs">Daily Capacity:</span>
                    <strong>{c.capacityPerDay} {t('common.quintals')}</strong>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-xs">Operating Hours:</span>
                    <strong>
                      {c.operatingHours.open} - {c.operatingHours.close}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-[#4B5563] font-mono flex items-center space-x-2 pt-2.5 border-t border-slate-100">
                <Phone size={14} className="text-[#4B5563]" />
                <span>{c.contactPhone || 'No contact phone listed'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
