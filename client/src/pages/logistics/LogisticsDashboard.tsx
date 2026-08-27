import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Timeline } from '../../components/common/Timeline';

export const LogisticsDashboard: React.FC = () => {
  const { t } = useTranslation();
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
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string>('');
  const [fetchError, setFetchError] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const res = await logisticsApi.getTasks();
      if (res.data.success) {
        setTasks(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load logistics tasks:', err);
      setFetchError(err.response?.data?.message || 'Failed to load transport tasks from registry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen to incoming logistics tasks via WebSocket
  useEffect(() => {
    if (latestLogisticsTask) {
      setTasks((prev) => {
        const exists = prev.some((task) => task._id === latestLogisticsTask._id);
        if (exists) {
          return prev.map((task) =>
            task._id === latestLogisticsTask._id ? latestLogisticsTask : task
          );
        }
        return [latestLogisticsTask, ...prev];
      });
      setSuccessBanner(
        `New Transport Task Dispatched from ${latestLogisticsTask.centreId?.name || 'Mandi Yard'}!`
      );
    }
  }, [latestLogisticsTask]);

  const handleOpenAssignModal = (task: ITransportTask) => {
    setSelectedTaskForAssign(task);
    setAssignForm({
      vehicleNumber: task.vehicleNumber || 'HR-05-CD-9988',
      driverName: task.driverName || 'Kuldeep Sharma',
      driverPhone: task.driverPhone || '9876543210',
      destinationWarehouse:
        task.destinationWarehouse || 'State Central Food Grain Silo - Hub A, Taraori',
    });
    setAssignError('');
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForAssign) return;

    if (!assignForm.vehicleNumber.trim() || !assignForm.driverName.trim()) {
      setAssignError('Vehicle registration number and Driver name are mandatory.');
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
        setTasks((prev) =>
          prev.map((t) => (t._id === selectedTaskForAssign._id ? res.data.data : t))
        );
        const taskCode = selectedTaskForAssign._id.slice(-6).toUpperCase();
        setSelectedTaskForAssign(null);
        setSuccessBanner(
          `Vehicle ${assignForm.vehicleNumber.toUpperCase()} assigned successfully to Task #${taskCode}`
        );
      }
    } catch (err: any) {
      setAssignError(err.response?.data?.message || 'Failed to assign fleet vehicle.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, nextStatus: TransportStatus) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await logisticsApi.updateStatus(taskId, { status: nextStatus });
      if (res.data.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.data : t)));
        setSuccessBanner(`Transport task updated to ${nextStatus.replace(/_/g, ' ')}.`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const readyCount = tasks.filter((t) => t.status === 'READY_FOR_PICKUP').length;
  const assignedCount = tasks.filter((t) => t.status === 'ASSIGNED').length;
  const inTransitCount = tasks.filter(
    (t) => t.status === 'IN_TRANSIT' || t.status === 'PICKUP_IN_PROGRESS'
  ).length;
  const deliveredCount = tasks.filter(
    (t) => t.status === 'DELIVERED' || t.status === 'COMPLETED'
  ).length;

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'READY') return task.status === 'READY_FOR_PICKUP';
    if (activeFilter === 'ASSIGNED') return task.status === 'ASSIGNED';
    if (activeFilter === 'TRANSIT')
      return task.status === 'PICKUP_IN_PROGRESS' || task.status === 'IN_TRANSIT';
    if (activeFilter === 'DELIVERED')
      return task.status === 'DELIVERED' || task.status === 'COMPLETED';
    return true;
  });

  if (isLoading && tasks.length === 0) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (fetchError && tasks.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Logistics Tasks"
        message={fetchError}
        onRetry={fetchTasks}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('logistics.dashboardTitle')}
        description="Automated Transport Dispatches from Mandis to State Central Grain Storage Silos"
        icon={<Truck size={24} />}
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="md"
              onClick={fetchTasks}
              isLoading={isLoading}
              icon={<RefreshCw size={14} />}
            >
              {t('common.search')}
            </Button>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-[#86EFAC] text-[#166534] rounded-2xl flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 size={18} className="text-[#15803D] shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 4 Responsive Operational Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('READY')}
          className="cursor-pointer transition hover:scale-[1.01]"
        >
          <StatCard
            title={t('logistics.readyForPickup')}
            value={readyCount}
            subtitle="Awaiting Fleet Assignment"
            icon={<PackageCheck size={18} />}
            color="amber"
          />
        </div>

        <div
          onClick={() => setActiveFilter('ASSIGNED')}
          className="cursor-pointer transition hover:scale-[1.01]"
        >
          <StatCard
            title={t('logistics.assigned')}
            value={assignedCount}
            subtitle="Drivers & Trucks Assigned"
            icon={<Truck size={18} />}
            color="blue"
          />
        </div>

        <div
          onClick={() => setActiveFilter('TRANSIT')}
          className="cursor-pointer transition hover:scale-[1.01]"
        >
          <StatCard
            title={t('logistics.inTransit')}
            value={inTransitCount}
            subtitle="En Route to State Godowns"
            icon={<Navigation size={18} />}
            color="purple"
          />
        </div>

        <div
          onClick={() => setActiveFilter('DELIVERED')}
          className="cursor-pointer transition hover:scale-[1.01]"
        >
          <StatCard
            title={t('logistics.delivered')}
            value={deliveredCount}
            subtitle="Verified at Silo Weighbridge"
            icon={<CheckCircle2 size={18} />}
            color="green"
          />
        </div>
      </div>

      {/* Main Transport Tasks Board */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Truck size={18} className="text-[#15803D]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1F2937]">
              {t('logistics.transportTasksTitle')} ({filteredTasks.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            {[
              { id: 'ALL', label: t('common.all'), count: tasks.length },
              { id: 'READY', label: t('logistics.readyForPickup'), count: readyCount },
              { id: 'ASSIGNED', label: t('logistics.assigned'), count: assignedCount },
              { id: 'TRANSIT', label: t('logistics.inTransit'), count: inTransitCount },
              { id: 'DELIVERED', label: t('logistics.delivered'), count: deliveredCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-white text-[#15803D] shadow-2xs font-extrabold'
                    : 'text-[#4B5563] hover:text-[#1F2937]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards Grid */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<Truck size={28} />}
            title={t('logistics.noTasks')}
            description="Transport tasks will appear automatically here as soon as Mandi authorities complete weighbridge procurements."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Row: Task ID + Badge */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-black text-[#1F2937] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          TASK-{task._id ? task._id.slice(-6).toUpperCase() : '000000'}
                        </span>
                        <span className="text-xs font-bold text-[#15803D]">
                          {task.quantity} {task.unit} {task.cropType}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4B5563] font-medium">
                        Farmer: <strong className="text-[#1F2937]">{task.farmerId?.name || 'Farmer'}</strong> ({task.farmerId?.phone || '—'})
                      </p>
                    </div>
                    <Badge status={task.status} size="sm" />
                  </div>

                  {/* Origin and Destination Card */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-[#1F2937]">
                      <MapPin size={14} className="text-[#15803D] shrink-0" />
                      <span className="font-semibold truncate">
                        From: {task.centreId?.name || 'Mandi Yard'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#4B5563]">
                      <Navigation size={14} className="text-[#0369A1] shrink-0" />
                      <span className="truncate">To: {task.destinationWarehouse || 'State Godown'}</span>
                    </div>
                  </div>

                  {/* Milestone Timeline */}
                  <div className="py-1">
                    <Timeline currentStatus={task.status} type="LOGISTICS" />
                  </div>

                  {/* Driver / Fleet Information if Assigned */}
                  {task.vehicleNumber ? (
                    <div className="bg-[#E0F2FE]/50 border border-[#7DD3FC] p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-mono font-bold text-[#0369A1]">{task.vehicleNumber}</p>
                        <p className="text-[#4B5563] text-[11px]">
                          Driver: {task.driverName} • {task.driverPhone || 'No Phone'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleOpenAssignModal(task)}
                            className="text-xs text-[#0369A1] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                            title="Edit Vehicle & Driver"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                        )}
                        <ShieldCheck size={18} className="text-[#0369A1]" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#854D0E] bg-[#FEF9C3]/60 p-2.5 rounded-xl border border-[#FDE047] flex items-center space-x-2">
                      <Clock size={14} />
                      <span>Awaiting driver & truck assignment</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#4B5563] font-mono">
                    Created: {task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>

                  {task.status === 'READY_FOR_PICKUP' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAssignModal(task)}
                      icon={<Truck size={13} />}
                    >
                      {t('logistics.assignFleetBtn')}
                    </Button>
                  )}

                  {(task.status === 'ASSIGNED' || task.status === 'PICKUP_IN_PROGRESS') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={updatingTaskId === task._id}
                      isLoading={updatingTaskId === task._id}
                      onClick={() => handleUpdateStatus(task._id, 'IN_TRANSIT')}
                      icon={<Navigation size={13} />}
                    >
                      {t('logistics.markInTransit')}
                    </Button>
                  )}

                  {task.status === 'IN_TRANSIT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={updatingTaskId === task._id}
                      isLoading={updatingTaskId === task._id}
                      onClick={() => handleUpdateStatus(task._id, 'DELIVERED')}
                      icon={<CheckCircle2 size={13} />}
                    >
                      {t('logistics.markDelivered')}
                    </Button>
                  )}

                  {(task.status === 'DELIVERED' || task.status === 'COMPLETED') && (
                    <span className="text-xs font-bold text-[#166534] flex items-center space-x-1">
                      <CheckCircle2 size={14} />
                      <span>{t('status.DELIVERED')}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Fleet Vehicle Modal */}
      {selectedTaskForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#14532D] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Truck size={20} className="text-[#86EFAC]" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {t('logistics.assignFleetBtn')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForAssign(null)}
                className="text-emerald-200 hover:text-white transition active:scale-95 cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              {assignError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                  <AlertCircle size={15} />
                  <span>{assignError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  {t('logistics.vehicleNumber')} *
                </label>
                <input
                  type="text"
                  value={assignForm.vehicleNumber}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, vehicleNumber: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. HR-05-CD-9988"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono uppercase text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  {t('logistics.driverName')} *
                </label>
                <input
                  type="text"
                  value={assignForm.driverName}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, driverName: e.target.value })
                  }
                  placeholder="e.g. Kuldeep Sharma"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  {t('logistics.driverPhone')}
                </label>
                <input
                  type="tel"
                  value={assignForm.driverPhone}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, driverPhone: e.target.value })
                  }
                  placeholder="e.g. 9876543210"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  {t('logistics.destinationWarehouse')}
                </label>
                <input
                  type="text"
                  value={assignForm.destinationWarehouse}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, destinationWarehouse: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTaskForAssign(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAssigning}
                  isLoading={isAssigning}
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
