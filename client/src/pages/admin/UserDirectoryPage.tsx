import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import { IUser } from '../../types';
import { Users, Search } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const UserDirectoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        role: roleFilter || undefined,
        search: search || undefined,
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await adminApi.toggleUserStatus(userId, nextStatus);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title={t('admin.manageUsers')}
        description="Manage system permissions, account activations, and roles for Farmers, Mandi staff, and Logistics."
        icon={<Users size={24} />}
        actions={
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / phone..."
              className="border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white cursor-pointer"
            >
              <option value="">{t('common.all')}</option>
              <option value="FARMER">{t('roles.FARMER')}</option>
              <option value="STORAGE_AUTHORITY">{t('roles.STORAGE_AUTHORITY')}</option>
              <option value="LOGISTICS">{t('roles.LOGISTICS')}</option>
              <option value="ADMIN">{t('roles.ADMIN')}</option>
            </select>
          </div>
        }
      />

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message={t('common.loading')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[#1F2937] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Mobile Contact</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">{t('common.status')}</th>
                  <th className="p-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <EmptyState
                        title={t('empty.noUsers')}
                        description="No registered users matched your current filter criteria."
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-[#1F2937]">{u.name}</td>
                      <td className="p-4 font-mono text-[#1F2937]">{u.phone}</td>
                      <td className="p-4 text-[#4B5563]">{u.email || '—'}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-[#1F2937] text-xs font-bold px-2 py-0.5 rounded uppercase border border-slate-200">
                          {t(`roles.${u.role}`, { defaultValue: u.role.replace(/_/g, ' ') })}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge status={u.status} size="sm" />
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(u._id, u.status)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </Button>
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
