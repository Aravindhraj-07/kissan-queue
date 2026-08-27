import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import { IAuditLog } from '../../types';
import { ScrollText, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchLogs = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ page: pageNum, limit: 30 });
      if (res.data.success) {
        setLogs(res.data.data);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('admin.auditTrailTitle')}
        description="Cryptographically timestamped operational log of all bookings, cancellations, token calls, weighments, and dispatches."
        icon={<ScrollText size={24} />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(page)}
            isLoading={isLoading}
            icon={<RefreshCw size={14} />}
          >
            Refresh Log Stream
          </Button>
        }
      />

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message={t('common.loading')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-mono">
              <thead className="bg-slate-50 text-[#1F2937] font-sans font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4">{t('admin.timestamp')} (IST)</th>
                  <th className="p-4">{t('admin.actor')}</th>
                  <th className="p-4">{t('admin.action')}</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Metadata Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <EmptyState
                        title={t('empty.noRecords')}
                        description="Audit logs are logged whenever system events take place."
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-[#4B5563] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#1F2937] block font-sans">
                          {log.actorName}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-[#4B5563] font-bold px-1.5 py-0.5 rounded font-sans border border-slate-200">
                          {t(`roles.${log.actorRole}`, { defaultValue: log.actorRole })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-md border border-[#86EFAC] text-xs">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-[#4B5563] font-sans text-xs font-semibold">
                        {log.entityType}
                      </td>
                      <td className="p-4 text-xs text-[#4B5563] max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
