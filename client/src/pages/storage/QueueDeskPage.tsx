import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { queueApi, bookingsApi, centresApi } from '../../services/api';
import { ILiveQueueSummary, IBooking, IProcurementCentre } from '../../types';
import {
  Radio,
  Volume2,
  Users,
  Scale,
  Sparkles,
  UserCheck,
  Building2,
  Clock,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const QueueDeskPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, centre: userCentre } = useAuth();
  const { joinCentreQueue, latestQueueData } = useSocket();
  const navigate = useNavigate();

  const [activeCentre, setActiveCentre] = useState<IProcurementCentre | null>(userCentre);
  const [queueData, setQueueData] = useState<ILiveQueueSummary | null>(null);
  const [todayBookings, setTodayBookings] = useState<IBooking[]>([]);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [deskMessage, setDeskMessage] = useState<string>('');

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
        console.error('Failed to init centres in QueueDesk:', err);
      }
    };
    initCentres();
  }, [userCentre]);

  const centreId = activeCentre?._id;

  const fetchQueue = async () => {
    if (!centreId) return;
    try {
      const [queueRes, bookingsRes] = await Promise.all([
        queueApi.getQueue(centreId),
        bookingsApi.getCentreBookings(centreId),
      ]);

      if (queueRes.data.success) {
        setQueueData(queueRes.data.data);
        joinCentreQueue(centreId);
      }
      if (bookingsRes.data.success) {
        setTodayBookings(bookingsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load queue desk:', err);
    }
  };

  useEffect(() => {
    if (centreId) {
      fetchQueue();
    }
  }, [centreId]);

  useEffect(() => {
    if (latestQueueData && latestQueueData.centreId === centreId) {
      setQueueData(latestQueueData);
    }
  }, [latestQueueData, centreId]);

  const handleCallNext = async () => {
    if (!centreId) return;
    setIsCalling(true);
    setDeskMessage('');
    try {
      const res = await queueApi.callNext(centreId);
      if (res.data.success) {
        setDeskMessage(`Called Token: ${res.data.data.calledToken || 'Next Farmer'}`);
        fetchQueue();
      }
    } catch (err: any) {
      setDeskMessage(err.response?.data?.message || 'Failed to call next token.');
    } finally {
      setIsCalling(false);
    }
  };

  const handleMarkArrived = async (bookingId: string) => {
    try {
      const res = await queueApi.markArrived(bookingId);
      if (res.data.success) {
        setDeskMessage(`Arrival verified for token ${res.data.data.booking?.tokenNumber}`);
        fetchQueue();
      }
    } catch (err: any) {
      setDeskMessage(err.response?.data?.message || 'Failed to mark arrival.');
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (!window.confirm('Mark farmer as No-Show? The vacant slot will be immediately reallocated to waitlisted farmers.')) {
      return;
    }

    try {
      const res = await queueApi.markNoShow(bookingId);
      if (res.data.success) {
        setDeskMessage(`Marked No-Show. Slot auto-reallocated to waitlist.`);
        fetchQueue();
      }
    } catch (err: any) {
      setDeskMessage(err.response?.data?.message || 'Failed to process no-show.');
    }
  };

  const currentProcessing = queueData?.currentProcessingBooking;
  const currentToken = queueData?.currentServingToken || 'None';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <PageHeader
        title={t('storage.liveQueueTitle')}
        description={`${activeCentre?.name || 'Mandi Yard'} • Manage gate check-ins, broadcast token calls to weighbridge, and handle arrivals.`}
        icon={<Radio size={24} />}
        actions={
          <Button
            variant="primary"
            size="lg"
            onClick={handleCallNext}
            disabled={isCalling || !centreId}
            isLoading={isCalling}
            icon={<Volume2 size={18} />}
          >
            {t('storage.callNextBtn')}
          </Button>
        }
      />

      {deskMessage && (
        <div className="p-4 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn">
          <Sparkles size={18} className="text-[#15803D] shrink-0" />
          <span>{deskMessage}</span>
        </div>
      )}

      {/* Main 2-Column Operational Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Currently Serving Farmer Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#14532D] text-white p-6 sm:p-7 rounded-3xl border border-[#166534] shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-[#166534] pb-3">
              <span className="text-[11px] font-bold text-[#86EFAC] uppercase tracking-widest">
                Active at Scale 1
              </span>
              <Badge status={currentProcessing ? 'PROCESSING' : 'WAITING'} size="sm" />
            </div>

            <div>
              <span className="text-xs text-emerald-200 uppercase font-bold tracking-wider">
                {t('storage.nowServing')}:
              </span>
              <h2 className="text-4xl sm:text-5xl font-black font-mono text-[#FDE047] mt-1 tracking-tight">
                {currentToken}
              </h2>
            </div>

            {currentProcessing ? (
              <div className="bg-[#166534] p-4 rounded-2xl border border-emerald-600/50 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Farmer:</span>
                  <span className="font-bold text-white">{currentProcessing.farmerId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Contact:</span>
                  <span className="font-mono text-emerald-100">{currentProcessing.farmerId?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">{t('common.crop')}:</span>
                  <span className="font-bold text-[#FDE047]">
                    {currentProcessing.requestedQuantity} {currentProcessing.unit} {currentProcessing.cropType}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-200 py-3 font-medium">
                No token currently being processed at weighbridge. Click "{t('storage.callNextBtn')}" above.
              </p>
            )}

            {currentProcessing && (
              <Button
                variant="warning"
                size="md"
                onClick={() => navigate('/storage/procurement')}
                className="w-full"
                icon={<Scale size={16} />}
              >
                {t('storage.completeWeighmentBtn')}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Arrived & Scheduled Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center space-x-2">
              <Users size={18} className="text-[#15803D]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#1F2937]">
                {t('storage.liveQueueTitle')} ({todayBookings.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-[#4B5563]">Real-Time Sync</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {todayBookings.length === 0 ? (
              <EmptyState
                title={t('storage.noProcurementToday')}
                description="Farmers scheduled for today will display here for gate check-in."
              />
            ) : (
              todayBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-[#1F2937] text-sm sm:text-base">
                        {b.tokenNumber}
                      </span>
                      <Badge status={b.status} size="sm" />
                    </div>
                    <p className="text-[#4B5563] font-medium text-xs">
                      {b.farmerId?.name} ({b.farmerId?.phone}) • {b.requestedQuantity} {b.unit} {b.cropType}
                    </p>
                    <p className="text-[11px] text-[#4B5563]">
                      {t('common.time')}: {b.slotId ? `${b.slotId.startTime} - ${b.slotId.endTime}` : '—'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {b.status === 'CONFIRMED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkArrived(b._id)}
                        icon={<UserCheck size={13} />}
                      >
                        {t('storage.checkInBtn')}
                      </Button>
                    )}

                    {(b.status === 'CONFIRMED' || b.status === 'ARRIVED') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleMarkNoShow(b._id)}
                        title="Reallocate slot if farmer does not arrive"
                      >
                        {t('storage.markNoShowBtn')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
