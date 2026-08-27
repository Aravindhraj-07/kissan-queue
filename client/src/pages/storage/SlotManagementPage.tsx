import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { slotsApi, centresApi } from '../../services/api';
import { ISlot, IProcurementCentre } from '../../types';
import { CalendarRange, Plus, Clock, Inbox, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const SlotManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { centre: userCentre } = useAuth();
  const [activeCentre, setActiveCentre] = useState<IProcurementCentre | null>(userCentre);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '17:30',
    endTime: '19:30',
    capacity: 8,
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const initCentres = async () => {
      try {
        if (!activeCentre) {
          const res = await centresApi.getCentres();
          if (res.data.success && res.data.data.length > 0) {
            setActiveCentre(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to init centre in SlotManagement:', err);
      }
    };
    initCentres();
  }, [userCentre]);

  const centreId = activeCentre?._id;

  const fetchSlots = async () => {
    if (!centreId) return;
    try {
      const res = await slotsApi.getSlots(centreId, selectedDate);
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  useEffect(() => {
    if (centreId) {
      fetchSlots();
    }
  }, [centreId, selectedDate]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centreId) return;

    try {
      const res = await slotsApi.createSlot({
        centreId,
        date: selectedDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        capacity: Number(newSlot.capacity),
      });

      if (res.data.success) {
        setMessage('New procurement slot created successfully.');
        setIsAdding(false);
        fetchSlots();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create slot.');
    }
  };

  const handleUpdateCapacity = async (slotId: string, currentCap: number, delta: number) => {
    const newCap = Math.max(1, currentCap + delta);
    try {
      const res = await slotsApi.updateCapacity(slotId, { capacity: newCap });
      if (res.data.success) {
        fetchSlots();
      }
    } catch (err) {
      console.error('Failed to update slot capacity:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title={t('nav.todaysSchedule')}
        description={`${activeCentre?.name ? `${activeCentre.name} • ` : ''}Configure daily time windows and regulate Mandi gate entry limits to prevent yard congestion.`}
        icon={<CalendarRange size={24} />}
        actions={
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white cursor-pointer"
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAdding(!isAdding)}
              icon={<Plus size={16} />}
            >
              Add Slot
            </Button>
          </div>
        }
      />

      {message && (
        <div className="p-4 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-[#15803D] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add Slot Form Modal/Card */}
      {isAdding && (
        <form onSubmit={handleCreateSlot} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
            Create Custom Time Slot for {selectedDate}
          </h3>
          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#4B5563] mb-1">Start Time (24h)</label>
              <input
                type="text"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                placeholder="09:00"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-[#1F2937]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] mb-1">End Time (24h)</label>
              <input
                type="text"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                placeholder="11:00"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-[#1F2937]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4B5563] mb-1">Max Farmer Capacity</label>
              <input
                type="number"
                value={newSlot.capacity}
                onChange={(e) => setNewSlot({ ...newSlot, capacity: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold text-[#1F2937]"
                required
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

      {/* Slots List */}
      {slots.length === 0 ? (
        <EmptyState
          icon={<Clock size={24} />}
          title={`No time slots configured for ${selectedDate}`}
          description="Configure time windows for this date so farmers can book slots."
          actionText="Add New Slot Window"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {slots.map((s) => (
            <div key={s._id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-black text-[#1F2937] text-sm sm:text-base">
                  <Clock size={16} className="text-[#15803D]" />
                  <span>
                    {s.startTime} - {s.endTime}
                  </span>
                </div>
                <Badge status={s.status} size="sm" />
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-2.5 border-t border-slate-100">
                <span className="text-[#4B5563]">Booked Farmers:</span>
                <span className="font-bold text-[#1F2937]">{s.bookedCount} booked</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#4B5563]">Total Slot Capacity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateCapacity(s._id, s.capacity, -1)}
                    className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] font-black flex items-center justify-center text-xs transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-[#166534] text-base px-1">{s.capacity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateCapacity(s._id, s.capacity, 1)}
                    className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] font-black flex items-center justify-center text-xs transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
