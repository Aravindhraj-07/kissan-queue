import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi, procurementApi, centresApi } from '../../services/api';
import { IBooking, IProcurement, IProcurementCentre } from '../../types';
import { Scale, CheckCircle2, AlertCircle, Sparkles, Inbox } from 'lucide-react';
import { DigitalSlipModal } from '../../components/common/DigitalSlipModal';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ProcurementWeighPage: React.FC = () => {
  const { t } = useTranslation();
  const { centre: userCentre } = useAuth();
  const navigate = useNavigate();

  const [activeCentre, setActiveCentre] = useState<IProcurementCentre | null>(userCentre);
  const [activeBookings, setActiveBookings] = useState<IBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  // Form State
  const [actualQuantity, setActualQuantity] = useState<number>(25);
  const [qualityGrade, setQualityGrade] = useState<'Grade A' | 'Grade B' | 'Grade C' | 'FAQ'>('Grade A');
  const [moisturePercent, setMoisturePercent] = useState<number>(11.5);
  const [mspPrice, setMspPrice] = useState<number>(2275);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedSlip, setGeneratedSlip] = useState<IProcurement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

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
        console.error('Failed to init centre in ProcurementWeigh:', err);
      }
    };
    initCentres();
  }, [userCentre]);

  const centreId = activeCentre?._id;

  useEffect(() => {
    if (!centreId) return;
    const fetchActive = async () => {
      try {
        const res = await bookingsApi.getCentreBookings(centreId);
        if (res.data.success) {
          const processings = res.data.data.filter(
            (b) => b.status === 'PROCESSING' || b.status === 'ARRIVED'
          );
          setActiveBookings(processings);
          if (processings.length > 0) {
            setSelectedBooking(processings[0]);
            setActualQuantity(processings[0].requestedQuantity);
          } else {
            setSelectedBooking(null);
          }
        }
      } catch (err) {
        console.error('Failed to load active bookings for weighment:', err);
      }
    };
    fetchActive();
  }, [centreId]);

  const totalPayout = parseFloat((actualQuantity * mspPrice).toFixed(2));

  const handleSubmitProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !actualQuantity) {
      setErrorMsg('Please select a farmer booking and enter actual weighment quantity.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await procurementApi.recordProcurement({
        bookingId: selectedBooking._id,
        actualQuantity,
        qualityGrade,
        moisturePercent,
        mspPricePerQuintal: mspPrice,
        notes,
      });

      if (res.data.success) {
        setGeneratedSlip(res.data.data.procurement);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record procurement transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('storage.procurementScaleTitle')}
        description={`${activeCentre?.name ? `${activeCentre.name} • ` : ''}Record verified weighbridge scale readings, moisture percentage, and issue official digital e-Procurement slips.`}
        icon={<Scale size={24} />}
      />

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitProcurement} className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Farmer Selection & Inputs */}
        <div className="md:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          {/* Active Booking Picker */}
          <div>
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider mb-2">
              Select Farmer at Weighbridge
            </label>
            {activeBookings.length > 0 ? (
              <select
                value={selectedBooking?._id || ''}
                onChange={(e) => {
                  const b = activeBookings.find((x) => x._id === e.target.value);
                  if (b) {
                    setSelectedBooking(b);
                    setActualQuantity(b.requestedQuantity);
                  }
                }}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white cursor-pointer"
              >
                {activeBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    Token {b.tokenNumber} — {b.farmerId?.name} ({b.requestedQuantity} {b.unit}{' '}
                    {b.cropType})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-[#4B5563] flex items-center space-x-2 font-semibold">
                <Inbox size={18} className="text-slate-400 shrink-0" />
                <span>No arrived farmers currently waiting in PROCESSING or ARRIVED state at scale.</span>
              </div>
            )}
          </div>

          {/* Actual Quantity Scale Input */}
          <div>
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider mb-1.5">
              {t('storage.netWeight')} *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={actualQuantity}
                onChange={(e) => setActualQuantity(parseFloat(e.target.value) || 0)}
                className="w-48 border border-slate-300 rounded-xl px-4 py-2.5 text-sm sm:text-base font-extrabold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                required
              />
              <span className="text-xs sm:text-sm font-bold text-[#4B5563]">{t('common.quintals')}</span>
            </div>
          </div>

          {/* Moisture and Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4B5563] mb-1.5">{t('storage.moisturePercent')}</label>
              <input
                type="number"
                step="0.1"
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
              <span className="text-[11px] text-[#4B5563] mt-1 block font-semibold">
                Govt Standard FAQ: &lt; 12.0%
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5563] mb-1.5">{t('storage.qualityGrade')}</label>
              <select
                value={qualityGrade}
                onChange={(e: any) => setQualityGrade(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none bg-white cursor-pointer"
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Grade C">Grade C (Commercial)</option>
                <option value="FAQ">FAQ (Fair Average Quality)</option>
              </select>
            </div>
          </div>

          {/* MSP Rate */}
          <div>
            <label className="block text-xs font-bold text-[#4B5563] mb-1.5">
              {t('storage.mspPrice')} (₹ / {t('common.quintals')})
            </label>
            <input
              type="number"
              value={mspPrice}
              onChange={(e) => setMspPrice(parseFloat(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
            />
          </div>
        </div>

        {/* Right Column: Instant Live Payout Calculation & Submit */}
        <div className="md:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="bg-[#14532D] text-white p-6 sm:p-7 rounded-3xl border border-[#166534] shadow-md space-y-4">
            <span className="text-[11px] font-black text-[#86EFAC] uppercase tracking-widest">
              {t('digitalSlip.dbtSummary')}
            </span>

            <div>
              <p className="text-xs text-emerald-200 font-semibold">{t('storage.totalPayout')}</p>
              <h3 className="text-3xl sm:text-4xl font-black text-[#FDE047] mt-1 tracking-tight">
                ₹{totalPayout.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-emerald-300 mt-1 font-mono">
                {actualQuantity} Qtl × ₹{mspPrice} / Qtl
              </p>
            </div>

            <div className="border-t border-[#166534] pt-3 space-y-2 text-xs text-emerald-100 font-medium">
              <div className="flex justify-between">
                <span className="text-emerald-300">{t('common.crop')}:</span>
                <strong className="text-white">{selectedBooking?.cropType || 'Produce'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{t('storage.qualityGrade')}:</span>
                <strong className="text-white">{qualityGrade}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{t('storage.moisturePercent')}:</span>
                <strong className="text-white">{moisturePercent}%</strong>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !selectedBooking}
            isLoading={isSubmitting}
            icon={<Sparkles size={18} />}
            className="w-full"
          >
            {t('storage.completeWeighmentBtn')}
          </Button>
        </div>
      </form>

      {/* Slip Modal after completion */}
      <DigitalSlipModal
        procurement={generatedSlip}
        onClose={() => {
          setGeneratedSlip(null);
          navigate('/storage/queue-desk');
        }}
      />
    </div>
  );
};
