import React, { useState, useEffect } from 'react';
import { bookingsApi, procurementApi } from '../../services/api';
import { IBooking, IProcurement } from '../../types';
import { FileText, Calendar, XCircle, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { DigitalSlipModal } from '../../components/common/DigitalSlipModal';

export const FarmerHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [procurements, setProcurements] = useState<IProcurement[]>([]);
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'SLIPS'>('BOOKINGS');
  const [selectedSlip, setSelectedSlip] = useState<IProcurement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [bookingsRes, procurementsRes] = await Promise.all([
        bookingsApi.getMyBookings(),
        procurementApi.getMyProcurements(),
      ]);

      if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
      if (procurementsRes.data.success) setProcurements(procurementsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The slot will be auto-reallocated to waitlisted farmers.')) {
      return;
    }

    try {
      const res = await bookingsApi.cancelBooking(bookingId);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Booking cancelled. Slot has been freed for reallocation.' });
        fetchData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel booking.' });
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your tokens and receipts..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Bookings & Procurement Receipts"
        description="View your digital token histories, download official MSP payout receipts, and manage scheduled Mandi bookings."
        icon={<FileText size={24} />}
        actions={
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'BOOKINGS'
                  ? 'bg-[#15803D] text-white shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1F2937]'
              }`}
            >
              All Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('SLIPS')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'SLIPS'
                  ? 'bg-[#15803D] text-white shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#1F2937]'
              }`}
            >
              Procurement Slips ({procurements.length})
            </button>
          </div>
        }
      />

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn ${
            message.type === 'success'
              ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Bookings View */}
      {activeTab === 'BOOKINGS' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[#1F2937] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4">Token / ID</th>
                  <th className="p-4">Mandi Centre</th>
                  <th className="p-4">Produce</th>
                  <th className="p-4">Scheduled Slot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <EmptyState
                        title="No bookings found"
                        description="You haven't made any Mandi slot bookings yet."
                        actionText="Book New Slot"
                        onAction={() => window.location.assign('/farmer/book')}
                      />
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const canCancel =
                      b.status === 'CONFIRMED' || b.status === 'WAITLISTED' || b.status === 'PENDING';
                    return (
                      <tr key={b._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono font-black text-[#1F2937]">
                          {b.tokenNumber}
                          <span className="block text-[11px] text-[#4B5563] font-sans font-normal">
                            Via {b.bookingSource}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#1F2937] block">{b.centreId?.name}</span>
                          <span className="text-xs text-[#4B5563]">{b.centreId?.district}</span>
                        </td>
                        <td className="p-4 font-semibold text-[#1F2937]">
                          {b.requestedQuantity} {b.unit} {b.cropType}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#1F2937] block">{b.scheduledDate}</span>
                          <span className="text-xs text-[#4B5563]">
                            {b.slotId?.startTime} - {b.slotId?.endTime}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge status={b.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          {canCancel && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelBooking(b._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Slips View */
        <div className="grid md:grid-cols-2 gap-4">
          {procurements.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                title="No completed procurement receipts found yet"
                description="When your harvest is weighed at the Mandi weighbridge, your official e-receipt will be generated here."
              />
            </div>
          ) : (
            procurements.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono font-black text-[#166534] text-xs sm:text-sm">
                      #{p.digitalSlipNumber}
                    </span>
                    <Badge status={p.qualityGrade} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-[#4B5563] block text-xs">Produce:</span>
                      <span className="font-bold text-[#1F2937]">
                        {p.actualQuantity} {p.unit} {p.cropType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4B5563] block text-xs">Total MSP Payout:</span>
                      <span className="font-black text-[#166534] text-base">
                        ₹{p.totalPayout.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4B5563] block text-xs">Mandi:</span>
                      <span className="font-semibold text-[#1F2937]">{p.centreId?.name}</span>
                    </div>
                    <div>
                      <span className="text-[#4B5563] block text-xs">Date:</span>
                      <span className="text-[#1F2937]">
                        {new Date(p.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedSlip(p)}
                  className="w-full mt-2"
                  icon={<Printer size={15} />}
                >
                  View Official e-Receipt
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Official Receipt Modal */}
      <DigitalSlipModal procurement={selectedSlip} onClose={() => setSelectedSlip(null)} />
    </div>
  );
};
