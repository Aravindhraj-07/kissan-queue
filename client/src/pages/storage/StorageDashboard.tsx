import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { queueApi, bookingsApi, centresApi } from '../../services/api';
import { ILiveQueueSummary, IBooking, IProcurementCentre } from '../../types';
import {
  Building2,
  Users,
  Radio,
  Scale,
  ArrowRight,
  Inbox,
  Clock,
  Megaphone,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const StorageDashboard: React.FC = () => {
  const { user, centre: userCentre } = useAuth();
  const { joinCentreQueue, latestQueueData } = useSocket();

  const [activeCentre, setActiveCentre] = useState<IProcurementCentre | null>(userCentre);
  const [allCentres, setAllCentres] = useState<IProcurementCentre[]>([]);
  const [queueData, setQueueData] = useState<ILiveQueueSummary | null>(null);
  const [todayBookings, setTodayBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load centres if not already populated on user profile
  useEffect(() => {
    const initCentres = async () => {
      try {
        if (!activeCentre) {
          const res = await centresApi.getCentres();
          if (res.data.success && res.data.data.length > 0) {
            setAllCentres(res.data.data);
            setActiveCentre(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to init centres:', err);
      }
    };
    initCentres();
  }, [userCentre]);

  const centreId = activeCentre?._id;

  const fetchData = async () => {
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
      console.error('Failed to fetch storage dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (centreId) {
      fetchData();
    }
  }, [centreId]);

  useEffect(() => {
    if (latestQueueData && latestQueueData.centreId === centreId) {
      setQueueData(latestQueueData);
    }
  }, [latestQueueData, centreId]);

  const completed = queueData?.completedCount || 0;
  const arrived = queueData?.arrivedCount || 0;
  const noShows = queueData?.noShowCount || 0;
  const currentToken = queueData?.currentServingToken || 'None';

  if (isLoading) {
    return <LoadingState message="Loading Mandi operations & live queues..." />;
  }

  if (!activeCentre) {
    return (
      <EmptyState
        icon={<Building2 size={28} />}
        title="No Assigned Mandi Found"
        description="Your account is not assigned to an active procurement centre. Please contact the administrator."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mandi Yard Header */}
      <PageHeader
        title={activeCentre?.name || 'Mandi Operations'}
        description={`${activeCentre?.address} • Operating Hours: ${activeCentre?.operatingHours.open} - ${activeCentre?.operatingHours.close} • Daily Capacity: ${activeCentre?.capacityPerDay || 0} Qtl`}
        icon={<Building2 size={24} />}
        badge={
          activeCentre?.centreCode ? (
            <span className="bg-slate-100 text-[#1F2937] font-mono text-xs px-2.5 py-1 rounded-md font-extrabold border border-slate-200">
              {activeCentre.centreCode}
            </span>
          ) : undefined
        }
        actions={
          <Link to="/storage/queue-desk">
            <Button
              variant="primary"
              size="md"
              icon={<Radio size={15} className="animate-pulse" />}
            >
              Open Live Queue Desk
            </Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Now Serving Token"
          value={currentToken}
          subtitle="At Scale Weighbridge 1"
          icon={<Megaphone size={18} />}
          color="amber"
        />

        <StatCard
          title="Arrived at Gate"
          value={arrived}
          subtitle="Checked in and waiting"
          icon={<Users size={18} />}
          color="blue"
        />

        <StatCard
          title="Procurement Done"
          value={completed}
          subtitle="Receipts issued today"
          icon={<Scale size={18} />}
          color="green"
        />

        <StatCard
          title="No-Shows / Vacant"
          value={noShows}
          subtitle="Reallocated to waitlist"
          icon={<Clock size={18} />}
          color="rose"
        />
      </div>

      {/* Today's Schedule and Arrival Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2">
            <Users size={18} className="text-[#15803D]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1F2937]">
              Today's Scheduled & Arrived Farmers
            </h3>
          </div>
          <Link
            to="/storage/queue-desk"
            className="text-xs font-bold text-[#15803D] hover:text-[#166534] hover:underline flex items-center space-x-1"
          >
            <span>Launch Live Calling Desk</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-[#1F2937] font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Token #</th>
                <th className="p-3.5">Farmer Name</th>
                <th className="p-3.5">Crop Produce</th>
                <th className="p-3.5">Slot Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState
                      title="No bookings scheduled for today"
                      description="Farmers who book procurement slots for today will appear here."
                    />
                  </td>
                </tr>
              ) : (
                todayBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-black text-[#1F2937]">{b.tokenNumber}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#1F2937] block">{b.farmerId?.name}</span>
                      <span className="text-xs text-[#4B5563] font-mono">{b.farmerId?.phone}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-[#1F2937]">
                      {b.requestedQuantity} {b.unit} {b.cropType}
                    </td>
                    <td className="p-3.5 text-[#4B5563]">
                      {b.slotId ? `${b.slotId.startTime} - ${b.slotId.endTime}` : '—'}
                    </td>
                    <td className="p-3.5">
                      <Badge status={b.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right">
                      {b.status === 'PROCESSING' && (
                        <Link to="/storage/procurement">
                          <Button variant="primary" size="sm" icon={<Scale size={13} />}>
                            Weigh Produce
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
