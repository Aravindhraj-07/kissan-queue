import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { centresApi, queueApi, bookingsApi } from '../../services/api';
import { IProcurementCentre, ILiveQueueSummary, IBooking } from '../../types';
import {
  Radio,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const LiveQueueTrackerPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { joinCentreQueue, latestQueueData } = useSocket();

  const [centres, setCentres] = useState<IProcurementCentre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>('');
  const [queueSummary, setQueueSummary] = useState<ILiveQueueSummary | null>(null);
  const [myBookings, setMyBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch Centres and Farmer's Bookings
  useEffect(() => {
    const init = async () => {
      try {
        const [centresRes, myBookingsRes] = await Promise.all([
          centresApi.getCentres(),
          bookingsApi.getMyBookings(),
        ]);

        if (centresRes.data.success && centresRes.data.data.length > 0) {
          setCentres(centresRes.data.data);

          // Default to the centre of today's booking or first centre
          const today = new Date().toISOString().split('T')[0];
          const todayBooking = myBookingsRes.data.data.find(
            (b) => b.scheduledDate === today && b.status !== 'CANCELLED'
          );

          const defaultCentreId = todayBooking?.centreId?._id || centresRes.data.data[0]._id;
          setSelectedCentreId(defaultCentreId);
          joinCentreQueue(defaultCentreId);
        }

        if (myBookingsRes.data.success) {
          setMyBookings(myBookingsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to init live queue:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Fetch Live Queue for selected centre
  const fetchQueueData = async (centreId: string) => {
    if (!centreId) return;
    try {
      const res = await queueApi.getQueue(centreId);
      if (res.data.success) {
        setQueueSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch queue summary:', err);
    }
  };

  useEffect(() => {
    if (selectedCentreId) {
      fetchQueueData(selectedCentreId);
      joinCentreQueue(selectedCentreId);
    }
  }, [selectedCentreId]);

  // Update when real-time socket message arrives
  useEffect(() => {
    if (latestQueueData && latestQueueData.centreId === selectedCentreId) {
      setQueueSummary(latestQueueData);
    }
  }, [latestQueueData, selectedCentreId]);

  // Find farmer's active token today at this centre
  const todayStr = new Date().toISOString().split('T')[0];
  const myActiveBooking = myBookings.find(
    (b) =>
      b.centreId?._id === selectedCentreId &&
      b.scheduledDate === todayStr &&
      b.status !== 'CANCELLED' &&
      b.status !== 'COMPLETED'
  );

  const currentServingToken =
    latestQueueData?.currentServingToken || queueSummary?.currentServingToken || 'None';
  const isMyTurn = myActiveBooking && myActiveBooking.tokenNumber === currentServingToken;

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  const selectedCentre = centres.find((c) => c._id === selectedCentreId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('nav.myQueue')}
        description="Real-time synchronized digital queue board direct from Mandi weighbridge scale sensors."
        icon={<Radio size={24} />}
        actions={
          <div className="flex items-center space-x-2 text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3.5 py-2 rounded-xl">
            <Radio size={15} className="text-[#15803D] animate-pulse" />
            <span>Socket.IO Live Connected</span>
          </div>
        }
      />

      {/* Centre Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-[#1F2937] uppercase tracking-wide">
          {t('common.mandi')}
        </label>
        <div className="flex flex-wrap gap-2">
          {centres.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCentreId(c._id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                selectedCentreId === c._id
                  ? 'bg-[#15803D] text-white shadow-xs font-extrabold'
                  : 'bg-slate-100 text-[#1F2937] hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Building2 size={15} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Turn Alert Banner */}
      {isMyTurn && (
        <div className="p-5 bg-[#FEF9C3] text-[#854D0E] border-2 border-[#FDE047] rounded-2xl shadow-xs animate-bounce-subtle flex items-center space-x-3">
          <Sparkles size={24} className="text-[#CA8A04] shrink-0 animate-spin" />
          <div>
            <h3 className="font-black text-base">{t('farmer.turnNowAlert')}</h3>
            <p className="text-xs text-[#854D0E] font-medium mt-0.5">
              Token {myActiveBooking.tokenNumber} is currently called to Weighbridge Scale 1.
            </p>
          </div>
        </div>
      )}

      {/* Hero Display Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Now Serving Display */}
        <div className="md:col-span-2 bg-[#14532D] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-[#166534]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-[#86EFAC] tracking-widest">
              {t('storage.nowServing')}
            </span>
            <div className="flex items-center space-x-1.5 bg-[#166534] px-3 py-1 rounded-full text-xs font-bold border border-emerald-600">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
              <span>Gate Live</span>
            </div>
          </div>

          <div className="my-8 text-center space-y-2">
            <h2 className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-[#FEF9C3]">
              {currentServingToken}
            </h2>
            <p className="text-sm text-emerald-200 font-medium">
              {currentServingToken === 'None'
                ? 'Scale is ready for next farmer'
                : `Weighbridge Scale 1 • ${selectedCentre?.name || 'Mandi Yard'}`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-[#166534]/60 p-4 rounded-2xl border border-emerald-600/50 text-center text-xs">
            <div>
              <span className="text-emerald-300 block text-[11px] font-bold">
                {t('storage.waitingGate')}
              </span>
              <span className="text-lg font-black text-white font-mono">
                {queueSummary?.arrivedCount || 0}
              </span>
            </div>
            <div>
              <span className="text-emerald-300 block text-[11px] font-bold">
                {t('storage.completedToday')}
              </span>
              <span className="text-lg font-black text-white font-mono">
                {queueSummary?.completedCount || 0}
              </span>
            </div>
            <div>
              <span className="text-emerald-300 block text-[11px] font-bold">
                {t('storage.todaysBookings')}
              </span>
              <span className="text-lg font-black text-white font-mono">
                {queueSummary?.totalBookedToday || 0}
              </span>
            </div>
          </div>
        </div>

        {/* My Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-[#1F2937]">
                {t('farmer.activeBookingTitle')}
              </h3>
              {myActiveBooking && <Badge status={myActiveBooking.status} size="sm" />}
            </div>

            {myActiveBooking ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-[#4B5563] block font-bold">
                    {t('common.token')}
                  </span>
                  <span className="text-3xl font-black font-mono text-[#15803D] block mt-1">
                    {myActiveBooking.tokenNumber}
                  </span>
                  <span className="text-xs text-[#4B5563] block mt-1 font-semibold">
                    {myActiveBooking.requestedQuantity} {myActiveBooking.unit} {myActiveBooking.cropType}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#4B5563]">
                    <span>{t('common.time')}:</span>
                    <strong className="text-[#1F2937]">
                      {myActiveBooking.slotId
                        ? `${myActiveBooking.slotId.startTime} - ${myActiveBooking.slotId.endTime}`
                        : 'Today'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#4B5563]">
                    <span>{t('farmer.queuePosition')}:</span>
                    <strong className="text-[#854D0E] font-bold">
                      {isMyTurn ? 'Serving Now' : 'In Line'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Clock size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-[#1F2937]">
                  {t('farmer.noActiveBooking')}
                </p>
                <p className="text-[11px] text-[#4B5563]">
                  {t('farmer.noActiveBookingDesc')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arrived Farmers Waiting in Yard Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Users size={18} className="text-[#15803D]" />
            <h3 className="font-extrabold text-sm sm:text-base text-[#1F2937]">
              {t('storage.waitingGate')} ({queueSummary?.activeQueue?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-[#4B5563]">
            {selectedCentre?.name || 'Mandi Yard'}
          </span>
        </div>

        {queueSummary?.activeQueue && queueSummary.activeQueue.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {queueSummary.activeQueue.map((item, idx) => (
              <div key={item.bookingId} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-mono font-bold text-xs flex items-center justify-center text-[#4B5563]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-[#1F2937]">{item.tokenNumber}</span>
                      <Badge status={item.status} size="sm" />
                    </div>
                    <span className="text-xs text-[#4B5563] font-medium block">
                      {item.requestedQuantity} {item.unit} {item.cropType} • {item.farmer?.name || 'Farmer'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#4B5563] block font-mono">
                    {item.slot ? `${item.slot.startTime} - ${item.slot.endTime}` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle2 size={24} />}
            title="No farmers waiting in the physical queue"
            description="The queue is clear. Arriving farmers will appear here as soon as they check in at the gate."
          />
        )}
      </div>
    </div>
  );
};
