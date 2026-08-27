import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Farmer
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { BookSlotPage } from './pages/farmer/BookSlotPage';
import { LiveQueueTrackerPage } from './pages/farmer/LiveQueueTrackerPage';
import { FarmerHistoryPage } from './pages/farmer/FarmerHistoryPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';

// Storage Authority
import { StorageDashboard } from './pages/storage/StorageDashboard';
import { QueueDeskPage } from './pages/storage/QueueDeskPage';
import { ProcurementWeighPage } from './pages/storage/ProcurementWeighPage';
import { SlotManagementPage } from './pages/storage/SlotManagementPage';

// Logistics
import { LogisticsDashboard } from './pages/logistics/LogisticsDashboard';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CentreManagementPage } from './pages/admin/CentreManagementPage';
import { UserDirectoryPage } from './pages/admin/UserDirectoryPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Authenticated Layout */}
      <Route element={<MainLayout />}>
        {/* Farmer Routes */}
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/book" element={<BookSlotPage />} />
        <Route path="/farmer/live-queue" element={<LiveQueueTrackerPage />} />
        <Route path="/farmer/history" element={<FarmerHistoryPage />} />
        <Route path="/farmer/profile" element={<FarmerProfilePage />} />

        {/* Storage Authority Routes */}
        <Route path="/storage" element={<StorageDashboard />} />
        <Route path="/storage/queue-desk" element={<QueueDeskPage />} />
        <Route path="/storage/procurement" element={<ProcurementWeighPage />} />
        <Route path="/storage/slots" element={<SlotManagementPage />} />

        {/* Logistics Routes */}
        <Route path="/logistics" element={<LogisticsDashboard />} />
        <Route path="/logistics/tasks" element={<LogisticsDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/centres" element={<CentreManagementPage />} />
        <Route path="/admin/users" element={<UserDirectoryPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
