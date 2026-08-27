import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Clock,
  Megaphone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const StorageDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, centre: userCentre } = useAuth();
  const { joinCentreQueue, latestQueueData } = useSocket();

  const [activeCentre, setActiveCentre] = useState<IProcurementCentre | null>(userCentre);
  const [queueData, setQueueData] = useState<ILiveQueueSummary | null>(null);
  const [todayBookings, setTodayBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callMessage, setCallMessage] = useState<string>('');

  // Load centres if not already populated on user profile
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

  const handleCallNext = async () => {
    if (!centreId) return;
    setIsCalling(true);
    setCallMessage('');
    try {
      const res = await queueApi.callNext(centreId);
      if (res.data.success) {
        setCallMessage(res.data.message || 'Next farmer called to Weighbridge Scale 1.');
        fetchData();
      }
    } catch (err: any) {
      setCallMessage(err.response?.data?.message || 'No arrived farmers waiting in queue to call.');
    } finally {
      setIsCalling(false);
    }
  };

  const completed = queueData?.completedCount || 0;
  const arrived = queueData?.arrivedCount || 0;
  const currentToken = queueData?.currentServingToken || 'None';

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (!activeCentre) {
    return (
      <EmptyState
        icon={<Building2 size={28} />}
        title={t('empty.noCentres')}
        description={t('storage.noProcurementToday')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mandi Yard Header */}
      <PageHeader
        title={activeCentre?.name || t('storage.dashboardTitle')}
        description={`${activeCentre?.address} • ${t('common.time')}: ${activeCentre?.operatingHours.open} - ${activeCentre?.operatingHours.close} • ${t('storage.availableCapacity')}: ${activeCentre?.capacityPerDay || 0} ${t('common.quintals')}`}
        icon={<Building2 size={24} />}
        badge={
          activeCentre?.centreCode ? (
            <span className="bg-slate-100 text-[#1F2937] font-mono text-xs px-2.5 py-1 rounded-md font-extrabold border border-slate-200">
              {activeCentre.centreCode}
            </span>
          ) : undefined
        }
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleCallNext}
              disabled={isCalling}
              isLoading={isCalling}
              icon={<Megaphone size={16} />}
            >
              {t('storage.callNextBtn')}
            </Button>
            <Link to="/storage/queue-desk">
              <Button
                variant="secondary"
                size="md"
                icon={<Radio size={15} className="animate-pulse text-[#15803D]" />}
              >
                {t('nav.liveQueue')}
              </Button>
            </Link>
          </div>
        }
      />

      {callMessage && (
        <div className="p-4 bg-emerald-50 border border-[#86EFAC] text-[#166534] rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-[#15803D] shrink-0" />
          <span>{callMessage}</span>
        </div>
      )}

      {/* Operational Metrics Row (4 Responsive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('storage.nowServing')}
          value={currentToken}
          subtitle="At Scale Weighbridge 1"
          icon={<Megaphone size={18} />}
          color="amber"
        />

        <StatCard
          title={t('storage.waitingGate')}
          value={arrived}
          subtitle="Checked in and waiting in yard"
          icon={<Users size={18} />}
          color="blue"
        />

        <StatCard
          title={t('storage.completedToday')}
          value={completed}
          subtitle="Verified weighbridge slips issued"
          icon={<Scale size={18} />}
          color="green"
        />

        <StatCard
          title={t('storage.todaysBookings')}
          value={todayBookings.length}
          subtitle="Total farmer slots reserved"
          icon={<Clock size={18} />}
          color="slate"
        />
      </div>

      {/* Today's Schedule and Arrival Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2">
            <Users size={18} className="text-[#15803D]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1F2937]">
              {t('storage.todaysBookings')} ({todayBookings.length})
            </h3>
          </div>
          <Link
            to="/storage/queue-desk"
            className="text-xs font-bold text-[#15803D] hover:text-[#166534] hover:underline flex items-center space-x-1"
          >
            <span>{t('storage.liveQueueTitle')}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-[#1F2937] font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">{t('common.token')}</th>
                <th className="p-3.5">Farmer Name</th>
                <th className="p-3.5">{t('common.crop')}</th>
                <th className="p-3.5">{t('common.time')}</th>
                <th className="p-3.5">{t('common.status')}</th>
                <th className="p-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState
                      title={t('storage.noProcurementToday')}
                      description={t('farmer.noActiveBookingDesc')}
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
                            {t('storage.completeWeighmentBtn')}
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
