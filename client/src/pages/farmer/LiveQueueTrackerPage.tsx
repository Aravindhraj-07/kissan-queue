import React, { useState, useEffect } from 'react';
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
    return <LoadingState message="Connecting to live Mandi queue stream..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Live Mandi Queue & Scale Display"
        description="Real-time synchronized digital queue board direct from Mandi weighbridge scale sensors."
        icon={<Radio size={24} />}
        actions={
          <div className="flex items-center space-x-2 text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3.5 py-2 rounded-xl">
            <Radio size={15} className="text-[#15803D] animate-pulse" />
            <span>Socket.IO Live Connected</span>
          </div>
        }
      />

      {/* Centre Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Building2 size={20} className="text-[#15803D]" />
          <span className="text-xs font-extrabold text-[#4B5563] uppercase tracking-wider">
            Select Mandi Yard:
          </span>
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white cursor-pointer"
          >
            {centres.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.centreCode})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[#4B5563] font-semibold">
          Automatic refresh on weighment completion
        </span>
      </div>

      {/* CALLOUT ALERT IF TURN HAS ARRIVED */}
      {isMyTurn && (
        <div className="bg-[#FEF9C3] text-[#854D0E] p-6 rounded-3xl shadow-md animate-bounce-subtle border-2 border-[#FDE047] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <Sparkles size={22} className="text-[#CA8A04] animate-spin" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                YOUR TOKEN IS CURRENTLY CALLED!
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#713F12]">
              Token <strong className="font-mono text-base">{myActiveBooking?.tokenNumber}</strong> is
              being served at Weighbridge Scale 1. Please drive your vehicle inside the gate.
            </p>
          </div>
        </div>
      )}

      {/* MAIN DIGITAL QUEUE DISPLAY BOARD */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Huge Live Serving Screen */}
        <div className="lg:col-span-5 bg-[#14532D] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#166534] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#166534] pb-3 mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#86EFAC] font-black">
                Mandi Gate Display Board
              </span>
              <span className="text-[10px] bg-[#052E16] text-[#86EFAC] border border-[#166534] px-2.5 py-0.5 rounded-full font-extrabold">
                Live IST
              </span>
            </div>
            <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Now Serving Token at Scale 1
            </h3>
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-[#FDE047] mt-3">
              {currentServingToken}
            </div>
            <p className="text-xs text-emerald-100 mt-2 font-medium">
              Mandi:{' '}
              <strong className="text-white">{queueSummary?.centreName || 'Grain Market Yard'}</strong>
            </p>
          </div>

          {/* Farmer's Personal Token Sub-card */}
          {myActiveBooking ? (
            <div className="bg-[#166534] p-4 rounded-2xl border border-emerald-600/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-semibold">Your Registered Token:</span>
                <span className="font-black text-[#FDE047] font-mono text-base">
                  {myActiveBooking.tokenNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-semibold">Current State:</span>
                <Badge status={myActiveBooking.status} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-semibold">Produce:</span>
                <span className="font-bold text-white">
                  {myActiveBooking.requestedQuantity} {myActiveBooking.unit} {myActiveBooking.cropType}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#166534]/60 p-4 rounded-2xl border border-emerald-600/30 text-xs text-emerald-200 font-medium">
              You do not have an active booking at this Mandi today.
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#166534] text-center">
            <div>
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">In Queue</span>
              <span className="text-xl font-black text-[#4ADE80]">
                {queueSummary?.waitingInQueueCount || 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Completed</span>
              <span className="text-xl font-black text-sky-300">
                {queueSummary?.completedCount || 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Total Today</span>
              <span className="text-xl font-black text-white">
                {queueSummary?.totalBookedToday || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Arrived Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center space-x-2">
              <Users size={18} className="text-[#15803D]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#1F2937]">
                Arrived & Waiting Queue (Live)
              </h3>
            </div>
            <span className="text-xs font-bold text-[#4B5563]">
              Avg Processing: 10-12 mins / farmer
            </span>
          </div>

          {queueSummary?.activeQueue && queueSummary.activeQueue.length > 0 ? (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {queueSummary.activeQueue.map((item, index) => {
                const isMe = myActiveBooking?.tokenNumber === item.tokenNumber;
                return (
                  <div
                    key={item.bookingId}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between text-xs sm:text-sm ${
                      isMe
                        ? 'bg-[#DCFCE7]/60 border-[#86EFAC] ring-2 ring-[#15803D]'
                        : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          isMe
                            ? 'bg-[#15803D] text-white'
                            : 'bg-slate-200 text-[#1F2937]'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-[#1F2937] text-sm sm:text-base">
                            {item.tokenNumber}
                          </span>
                          {isMe && (
                            <span className="bg-[#15803D] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
                          {item.farmer?.name || 'Farmer'} • {item.requestedQuantity} {item.unit}{' '}
                          {item.cropType}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-bold text-[#4B5563] text-xs flex items-center justify-end space-x-1">
                        <Clock size={12} className="text-[#EAB308]" />
                        <span>~{item.estimatedWaitMinutes} mins</span>
                      </span>
                      <Badge status={item.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 size={24} className="text-[#15803D]" />}
              title="No farmers currently waiting in arrived queue"
              description="New arrivals checked in at the gate will display here in real-time."
            />
          )}
        </div>
      </div>
    </div>
  );
};
