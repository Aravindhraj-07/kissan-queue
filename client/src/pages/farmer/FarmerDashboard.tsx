import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { farmerApi } from '../../services/api';
import { IBooking, IProcurement } from '../../types';
import {
  CalendarPlus,
  Radio,
  Clock,
  Sparkles,
  FileText,
  ArrowRight,
  Scale,
  MapPin,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Timeline } from '../../components/common/Timeline';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { DigitalSlipModal } from '../../components/common/DigitalSlipModal';

export const FarmerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { latestQueueData, joinCentreQueue } = useSocket();

  const [overview, setOverview] = useState<any>(null);
  const [selectedSlip, setSelectedSlip] = useState<IProcurement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOverview = async () => {
    try {
      const res = await farmerApi.getOverview();
      if (res.data.success) {
        setOverview(res.data.data);
        if (res.data.data.todayBooking?.centreId?._id) {
          joinCentreQueue(res.data.data.todayBooking.centreId._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch farmer overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const todayBooking: IBooking | null = overview?.todayBooking || null;
  const currentServing =
    latestQueueData?.currentServingToken || overview?.liveQueueInfo?.currentServingToken || 'None';
  const isMyTurn =
    Boolean(todayBooking?.tokenNumber && currentServing === todayBooking?.tokenNumber) ||
    Boolean(overview?.liveQueueInfo?.isMyTurn);

  if (isLoading) {
    return <LoadingState message="Loading your farmer dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] tracking-tight">
              Namaste, {user?.name || 'Farmer'}!
            </h1>
            {profile?.farmerId && (
              <span className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                {profile.farmerId}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            {profile?.village ? `${profile.village}, ` : ''}
            {profile?.district ? `${profile.district}, ` : ''}
            {profile?.state ? `${profile.state} ` : ''}
            {profile?.farmDetails?.landAreaAcres
              ? `• Land Area: ${profile.farmDetails.landAreaAcres} Acres`
              : ''}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link to="/farmer/book">
            <Button variant="primary" icon={<CalendarPlus size={16} />}>
              Book New Mandi Slot
            </Button>
          </Link>
        </div>
      </div>

      {/* TODAY'S ACTIVE BOOKING & LIVE TIMELINE CARD */}
      {todayBooking ? (
        <div
          className={`rounded-2xl border p-6 sm:p-7 shadow-2xs transition-all ${
            isMyTurn
              ? 'bg-[#FEF9C3]/50 border-[#FDE047] ring-2 ring-[#EAB308]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] flex items-center justify-center font-bold text-xl shrink-0">
                🎟️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold text-[#4B5563]">
                    Today's Digital Token
                  </span>
                  <Badge status={todayBooking.status} size="sm" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight font-mono">
                  {todayBooking.tokenNumber}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link to="/farmer/live-queue">
                <Button variant="secondary" size="sm" icon={<Radio size={14} className="animate-pulse" />}>
                  Open Live Queue Tracker
                </Button>
              </Link>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-6 px-1">
            <Timeline currentStatus={todayBooking.status} type="PROCUREMENT" />
          </div>

          {/* Real-Time Live Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-[#4B5563] block font-semibold">Assigned Mandi</span>
              <span className="font-bold text-[#1F2937] text-xs block truncate mt-0.5">
                {todayBooking.centreId?.name || 'Mandi Centre'}
              </span>
            </div>

            <div>
              <span className="text-[#4B5563] block font-semibold">Produce Volume</span>
              <span className="font-bold text-[#1F2937] text-xs block mt-0.5">
                {todayBooking.requestedQuantity} {todayBooking.unit} {todayBooking.cropType}
              </span>
            </div>

            <div>
              <span className="text-[#4B5563] block font-semibold">Serving at Scale</span>
              <span className="font-bold text-[#166534] text-xs block font-mono mt-0.5">
                Token {currentServing}
              </span>
            </div>

            <div>
              <span className="text-[#4B5563] block font-semibold">Est. Waiting Time</span>
              <span className="font-bold text-[#854D0E] text-xs block flex items-center space-x-1 mt-0.5">
                <Clock size={13} className="text-[#EAB308]" />
                <span>
                  {overview?.liveQueueInfo?.estimatedWaitMinutes !== undefined
                    ? `~${overview.liveQueueInfo.estimatedWaitMinutes} mins`
                    : '10-15 mins'}
                </span>
              </span>
            </div>
          </div>

          {isMyTurn && (
            <div className="mt-4 p-4 bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2.5">
              <Sparkles size={18} className="text-[#CA8A04] shrink-0 animate-spin" />
              <span>
                🔔 YOUR TURN HAS ARRIVED! Please proceed immediately to Weighbridge Scale 1 at{' '}
                {todayBooking.centreId?.name}.
              </span>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarPlus size={24} />}
          title="No Procurement Booked for Today"
          description="Book an official time slot at your nearest Mandi before traveling to eliminate queue waiting times."
          actionText="Book Next Procurement Slot"
          onAction={() => window.location.assign('/farmer/book')}
        />
      )}

      {/* Metric Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Produce Procured"
          value={`${overview?.totalQuantityQuintals || 0} Quintals`}
          subtitle="Direct Mandi weighbridge records"
          icon={<Scale size={18} />}
          color="green"
        />

        <StatCard
          title="Total MSP DBT Transferred"
          value={`₹${(overview?.totalIncomeINR || 0).toLocaleString('en-IN')}`}
          subtitle="Direct Aadhaar bank transfer"
          icon={<span className="text-base font-bold">₹</span>}
          color="amber"
        />

        <StatCard
          title="Completed Transactions"
          value={overview?.pastProcurementsCount || 0}
          subtitle="Verified e-Procurement receipts"
          icon={<FileText size={18} />}
          color="blue"
        />
      </div>

      {/* Recent Completed Slips */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText size={18} className="text-[#15803D]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1F2937]">
              Recent Mandi Procurement Receipts
            </h3>
          </div>
          {overview?.recentProcurements?.length > 0 && (
            <Link
              to="/farmer/history"
              className="text-xs font-bold text-[#15803D] hover:text-[#166534] hover:underline flex items-center space-x-0.5"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {overview?.recentProcurements?.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {overview.recentProcurements.map((proc: IProcurement) => (
              <div key={proc._id} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#1F2937]">{proc.cropType}</span>
                    <Badge status={proc.qualityGrade} size="sm" />
                  </div>
                  <p className="text-[#4B5563] text-xs">
                    Qty: <strong>{proc.actualQuantity} {proc.unit}</strong> • Moisture: {proc.moisturePercent}% • {new Date(proc.timestamp).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-[#166534] text-sm sm:text-base">
                    ₹{proc.totalPayout.toLocaleString('en-IN')}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedSlip(proc)}
                  >
                    View Slip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No procurement transactions recorded yet"
            description="Completed procurement receipts and DBT payment slips will be archived here."
          />
        )}
      </div>

      {/* Slip Modal */}
      <DigitalSlipModal procurement={selectedSlip} onClose={() => setSelectedSlip(null)} />
    </div>
  );
};
