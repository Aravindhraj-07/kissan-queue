import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import {
  BarChart3,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  Scale,
  IndianRupee,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cropData = stats?.cropDistribution || [];
  const COLORS = ['#15803D', '#EAB308', '#0369A1', '#7E22CE', '#BE123C'];

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title={t('admin.dashboardTitle')}
        description="Real-time multi-mandi queue oversight, Direct Benefit Transfer (DBT) disbursement totals, and logistics tracking."
        icon={<BarChart3 size={24} />}
        badge={
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full">
            <ShieldCheck size={14} className="text-[#15803D]" />
            <span>Audit Trail Active</span>
          </div>
        }
      />

      {/* Metrics Row (4 Responsive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('admin.totalFarmers')}
          value={stats?.totalFarmers || 0}
          subtitle="Aadhaar-linked profiles"
          icon={<Users size={18} />}
          color="green"
        />

        <StatCard
          title={t('admin.activeCentres')}
          value={stats?.activeCentres || 0}
          subtitle="Operating live queues"
          icon={<Building2 size={18} />}
          color="amber"
        />

        <StatCard
          title={t('admin.totalProcuredVolume')}
          value={`${stats?.totalProcuredMetricTons || '0.0'} MT`}
          subtitle={`Total: ${stats?.totalProcuredQuintals || 0} ${t('common.quintals')}`}
          icon={<Scale size={18} />}
          color="blue"
        />

        <StatCard
          title={t('admin.totalDisbursed')}
          value={`₹${(stats?.totalPayoutINR || 0).toLocaleString('en-IN')}`}
          subtitle={t('farmer.disbursed')}
          icon={<IndianRupee size={18} />}
          color="purple"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop Volume Distribution Bar Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-[#1F2937]">
              {t('admin.grainDistribution')}
            </h3>
            <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-1 rounded-full">
              Season 2026
            </span>
          </div>

          {cropData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropData}>
                  <XAxis dataKey="crop" tick={{ fontSize: 12, fill: '#4B5563' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#1F2937',
                    }}
                  />
                  <Bar dataKey="quantityQuintals" fill="#15803D" radius={[6, 6, 0, 0]}>
                    {cropData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title={t('empty.noRecords')}
              description="Crop distribution graph will populate automatically as Mandi staff weigh farmer harvests."
            />
          )}
        </div>

        {/* Operational Efficiency & No-Show Rate */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm sm:text-base text-[#1F2937]">
                {t('admin.mandiPerformance')}
              </h3>
              <span className="text-xs font-bold text-[#4B5563]">{t('common.today')}</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[#4B5563] font-semibold">{t('admin.todayBookings')}:</span>
                <strong className="text-[#1F2937] text-sm sm:text-base font-mono">
                  {stats?.totalBookingsToday || 0}
                </strong>
              </div>

              <div className="flex justify-between items-center bg-[#DCFCE7]/60 p-3.5 rounded-xl border border-[#86EFAC]">
                <span className="text-[#166534] font-bold">{t('status.COMPLETED')}:</span>
                <strong className="text-[#166534] text-sm sm:text-base font-mono">
                  {(stats?.todayArrived || 0) + (stats?.todayCompleted || 0)}
                </strong>
              </div>

              <div className="flex justify-between items-center bg-[#FEF9C3]/60 p-3.5 rounded-xl border border-[#FDE047]">
                <span className="text-[#854D0E] font-bold">No-Show / Reallocation Rate:</span>
                <strong className="text-[#854D0E] text-sm sm:text-base font-mono">
                  {stats?.noShowRatePercent || '0.0'}%
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#4B5563]">{t('admin.auditTrailTitle')}</span>
            <Link
              to="/admin/audit-logs"
              className="text-[#15803D] font-bold hover:underline flex items-center space-x-1"
            >
              <span>{t('common.view')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
