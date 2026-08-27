import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { logisticsApi } from '../../services/api';
import { ITransportTask, TransportStatus } from '../../types';
import {
  Truck,
  PackageCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  User,
  Phone,
  ShieldCheck,
  X,
  Inbox,
  AlertCircle,
  Sparkles,
  Box,
  Scale,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { Timeline } from '../../components/common/Timeline';

export const LogisticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { latestLogisticsTask } = useSocket();

  const [tasks, setTasks] = useState<ITransportTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<ITransportTask | null>(null);

  // Assign Form State
  const [assignForm, setAssignForm] = useState({
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    destinationWarehouse: '',
  });
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignError, setAssignError] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTasks = async () => {
    try {
      const res = await logisticsApi.getTasks();
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load logistics tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // When Socket.IO broadcasts a real-time logistics dispatch event
  useEffect(() => {
    if (latestLogisticsTask) {
      fetchTasks();
    }
  }, [latestLogisticsTask]);

  const handleOpenAssignModal = (task: ITransportTask) => {
    setSelectedTaskForAssign(task);
    setAssignError('');
    setAssignForm({
      vehicleNumber: task.vehicleNumber || '',
      driverName: task.driverName || '',
      driverPhone: task.driverPhone || '',
      destinationWarehouse: task.destinationWarehouse || 'State Central Silo Complex Hub',
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForAssign) return;

    if (!assignForm.vehicleNumber.trim()) {
      setAssignError('Please enter the truck registration number (e.g. HR-05-CD-9988).');
      return;
    }
    if (!assignForm.driverName.trim()) {
      setAssignError('Please enter the driver full name.');
      return;
    }

    setIsAssigning(true);
    setAssignError('');

    try {
      const res = await logisticsApi.assignTask(selectedTaskForAssign._id, {
        vehicleNumber: assignForm.vehicleNumber.trim().toUpperCase(),
        driverName: assignForm.driverName.trim(),
        driverPhone: assignForm.driverPhone.trim(),
        destinationWarehouse: assignForm.destinationWarehouse.trim(),
      });

      if (res.data.success) {
        setSuccessBanner(`Truck ${assignForm.vehicleNumber.toUpperCase()} successfully assigned to driver ${assignForm.driverName}!`);
        setSelectedTaskForAssign(null);
        fetchTasks();
        setTimeout(() => setSuccessBanner(''), 5000);
      }
    } catch (err: any) {
      setAssignError(err.response?.data?.message || 'Failed to assign vehicle. Please check input.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusProgress = async (taskId: string, nextStatus: TransportStatus) => {
    try {
      const res = await logisticsApi.updateStatus(taskId, { status: nextStatus });
      if (res.data.success) {
        fetchTasks();
        setSuccessBanner(`Transport status updated to ${nextStatus.replace(/_/g, ' ')}.`);
        setTimeout(() => setSuccessBanner(''), 4000);
      }
    } catch (err: any) {
      setSuccessBanner('');
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Metrics derived purely from database tasks
  const readyCount = tasks.filter((t) => t.status === 'READY_FOR_PICKUP').length;
  const inTransitCount = tasks.filter(
    (t) => t.status === 'IN_TRANSIT' || t.status === 'PICKUP_IN_PROGRESS' || t.status === 'PICKED_UP' || t.status === 'ASSIGNED'
  ).length;
  const deliveredCount = tasks.filter(
    (t) => t.status === 'DELIVERED' || t.status === 'COMPLETED'
  ).length;
  const totalVolume = tasks.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'READY') return t.status === 'READY_FOR_PICKUP';
    if (activeFilter === 'IN_TRANSIT')
      return t.status === 'IN_TRANSIT' || t.status === 'PICKUP_IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'PICKED_UP';
    if (activeFilter === 'DELIVERED') return t.status === 'DELIVERED' || t.status === 'COMPLETED';
    return true;
  });

  if (isLoading) {
    return <LoadingState message="Loading live logistics and transport tasks..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="State Food Grain Logistics & Fleet Cell"
        description="Real-time pipeline: Automatically receives transport batches as Mandi staff complete farmer weighments."
        icon={<Truck size={24} />}
        badge={
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full">
            <ShieldCheck size={14} className="text-[#15803D]" />
            <span>Mandi Weighbridge Auto-Trigger</span>
          </div>
        }
      />

      {successBanner && (
        <div className="p-4 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2.5 animate-fadeIn">
          <Sparkles size={18} className="text-[#15803D] shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ready for Pickup"
          value={readyCount}
          subtitle="At Mandi yards"
          icon={<Box size={18} />}
          color="amber"
        />

        <StatCard
          title="Assigned & In Transit"
          value={inTransitCount}
          subtitle="Fleet moving to Silos"
          icon={<Truck size={18} />}
          color="blue"
        />

        <StatCard
          title="Delivered & Stored"
          value={deliveredCount}
          subtitle="Warehouse verified"
          icon={<PackageCheck size={18} />}
          color="green"
        />

        <StatCard
          title="Total Volume Managed"
          value={`${totalVolume.toFixed(1)} Qtl`}
          subtitle={`Metric Tons: ${(totalVolume / 10).toFixed(1)} MT`}
          icon={<Scale size={18} />}
          color="purple"
        />
      </div>

      {/* Dispatches Board & Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Truck size={18} className="text-[#15803D]" />
            <h3 className="font-extrabold text-sm sm:text-base text-[#1F2937]">
              Transport Dispatches Board
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {['ALL', 'READY', 'IN_TRANSIT', 'DELIVERED'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  activeFilter === f
                    ? 'bg-[#15803D] text-white shadow-2xs'
                    : 'text-[#4B5563] hover:text-[#1F2937]'
                }`}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                icon={<Truck size={28} />}
                title="No transport tasks available"
                description="Transport dispatches appear here automatically when Mandi authorities complete farmer procurement at the weighbridge."
              />
            </div>
          ) : (
            filteredTasks.map((t) => {
              const farmerName = (t as any).farmerId?.name || (t.procurementId as any)?.farmerId?.name || 'Verified Farmer';
              const farmerPhone = (t as any).farmerId?.phone || (t.procurementId as any)?.farmerId?.phone || '';

              return (
                <div
                  key={t._id}
                  className="bg-slate-50 hover:bg-slate-100/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <span className="font-extrabold text-[#1F2937] text-sm">
                        {t.quantity} {t.unit} • {t.cropType}
                      </span>
                      <Badge status={t.status} size="sm" />
                    </div>

                    {/* Visual Logistics Timeline */}
                    <div className="py-1">
                      <Timeline currentStatus={t.status} type="LOGISTICS" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                      <div>
                        <span className="text-[#4B5563] block text-xs">Origin Mandi:</span>
                        <span className="font-bold text-[#1F2937] truncate block">
                          {t.centreId?.name || 'Mandi Yard'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4B5563] block text-xs">Procured From:</span>
                        <span className="font-bold text-[#1F2937] truncate block">
                          {farmerName} {farmerPhone ? `(${farmerPhone})` : ''}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#4B5563] block text-xs">Destination Silo:</span>
                        <span className="font-bold text-[#1F2937] truncate block">
                          {t.destinationWarehouse}
                        </span>
                      </div>
                    </div>

                    {t.vehicleNumber && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#4B5563]">Truck Registration:</span>
                          <strong className="font-mono text-[#166534] font-bold">{t.vehicleNumber}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#4B5563]">Driver Name:</span>
                          <span className="font-semibold text-[#1F2937]">{t.driverName}</span>
                        </div>
                        {t.driverPhone && (
                          <div className="flex justify-between">
                            <span className="text-[#4B5563]">Driver Contact:</span>
                            <span className="font-mono text-[#1F2937]">{t.driverPhone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Pipeline Steps */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                    {t.status === 'READY_FOR_PICKUP' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenAssignModal(t)}
                        icon={<Truck size={14} />}
                      >
                        Assign Vehicle & Driver
                      </Button>
                    )}

                    {t.status === 'ASSIGNED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusProgress(t._id, 'IN_TRANSIT')}
                        icon={<Navigation size={14} />}
                      >
                        Mark Dispatched (In Transit)
                      </Button>
                    )}

                    {t.status === 'IN_TRANSIT' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusProgress(t._id, 'DELIVERED')}
                        icon={<CheckCircle2 size={14} />}
                      >
                        Mark Silo Delivered
                      </Button>
                    )}

                    {(t.status === 'DELIVERED' || t.status === 'COMPLETED') && (
                      <span className="text-[#166534] text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 size={16} />
                        <span>Delivery Confirmed & Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedTaskForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Truck size={20} className="text-[#15803D]" />
                <h3 className="font-extrabold text-base text-[#1F2937]">Assign Fleet Vehicle & Driver</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForAssign(null)}
                className="text-[#4B5563] hover:text-[#1F2937] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {assignError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-[#1F2937] mb-1">Truck Vehicle Number *</label>
                <input
                  type="text"
                  value={assignForm.vehicleNumber}
                  onChange={(e) => setAssignForm({ ...assignForm, vehicleNumber: e.target.value })}
                  placeholder="e.g. HR-05-CD-9988"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono uppercase text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  value={assignForm.driverName}
                  onChange={(e) => setAssignForm({ ...assignForm, driverName: e.target.value })}
                  placeholder="e.g. Kuldeep Sharma"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">Driver Phone Number</label>
                <input
                  type="text"
                  value={assignForm.driverPhone}
                  onChange={(e) => setAssignForm({ ...assignForm, driverPhone: e.target.value })}
                  placeholder="e.g. +91 98123-45678"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">Destination Silo / Godown</label>
                <input
                  type="text"
                  value={assignForm.destinationWarehouse}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, destinationWarehouse: e.target.value })
                  }
                  placeholder="e.g. Central Silo Hub Kurukshetra"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTaskForAssign(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isAssigning}
                >
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
