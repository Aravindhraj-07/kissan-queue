import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { centresApi, slotsApi, bookingsApi } from '../../services/api';
import { IProcurementCentre, ISlot, IBooking } from '../../types';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Radio,
  Building2,
  Sprout,
  Sun,
  Leaf,
  Boxes,
  Feather,
  Layers,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';

export const BookSlotPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [crops] = useState([
    { name: 'Wheat', icon: Sprout, msp: 2275, unit: 'Quintal' },
    { name: 'Paddy / Basmati Rice', icon: Leaf, msp: 2320, unit: 'Quintal' },
    { name: 'Mustard', icon: Sun, msp: 5650, unit: 'Quintal' },
    { name: 'Maize', icon: Boxes, msp: 2090, unit: 'Quintal' },
    { name: 'Cotton', icon: Feather, msp: 7020, unit: 'Quintal' },
    { name: 'Soybean', icon: Layers, msp: 4600, unit: 'Quintal' },
  ]);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [quantity, setQuantity] = useState<number>(25);
  const [centres, setCentres] = useState<IProcurementCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<IProcurementCentre | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);

  // Status state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<IBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch Centres on mount
  useEffect(() => {
    const fetchCentres = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const res = await centresApi.getCentres({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
              if (res.data.success) {
                setCentres(res.data.data);
                if (res.data.data.length > 0) setSelectedCentre(res.data.data[0]);
              }
            },
            async () => {
              const res = await centresApi.getCentres();
              if (res.data.success) {
                setCentres(res.data.data);
                if (res.data.data.length > 0) setSelectedCentre(res.data.data[0]);
              }
            }
          );
        } else {
          const res = await centresApi.getCentres();
          if (res.data.success) {
            setCentres(res.data.data);
            if (res.data.data.length > 0) setSelectedCentre(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load Mandi centres:', err);
      }
    };
    fetchCentres();
  }, []);

  // Fetch slots whenever centre or date changes
  useEffect(() => {
    if (!selectedCentre?._id) return;
    const fetchSlots = async () => {
      try {
        const res = await slotsApi.getSlots(selectedCentre._id, selectedDate);
        if (res.data.success) {
          setSlots(res.data.data);
          setSelectedSlot(null);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
    };
    fetchSlots();
  }, [selectedCentre, selectedDate]);

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!quantity || quantity <= 0) {
        setErrorMessage('Please specify a valid harvest quantity.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCentre) {
        setErrorMessage('Please select a Mandi centre.');
        return;
      }
      setStep(3);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedCentre || !selectedSlot) {
      setErrorMessage('Please choose a valid time slot window.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await bookingsApi.createBooking({
        centreId: selectedCentre._id,
        slotId: selectedSlot._id,
        cropType: selectedCrop,
        requestedQuantity: Number(quantity),
        unit: 'Quintal',
      });

      if (res.data.success) {
        setBookingSuccess(res.data.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Slot booking failed. Please try a different slot.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('farmer.wizardTitle')}
        description="Book your slot window in advance, receive a digital token, and skip long physical queues at the Mandi."
        icon={<Calendar size={24} />}
      />

      {/* Stepper Wizard Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm font-extrabold">
        <div
          className={`py-3 rounded-2xl border transition-all duration-150 ${
            step >= 1
              ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] shadow-2xs'
              : 'bg-white text-[#4B5563] border-slate-200'
          }`}
        >
          {t('farmer.wizardStep1')}
        </div>
        <div
          className={`py-3 rounded-2xl border transition-all duration-150 ${
            step >= 2
              ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] shadow-2xs'
              : 'bg-white text-[#4B5563] border-slate-200'
          }`}
        >
          {t('farmer.wizardStep2')}
        </div>
        <div
          className={`py-3 rounded-2xl border transition-all duration-150 ${
            step >= 3
              ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] shadow-2xs'
              : 'bg-white text-[#4B5563] border-slate-200'
          }`}
        >
          {t('farmer.wizardStep3')}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: CROP & QUANTITY */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider mb-3">
              {t('farmer.wizardStep1')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {crops.map((crop) => {
                const CropIcon = crop.icon;
                const isSelected = selectedCrop === crop.name;
                return (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => setSelectedCrop(crop.name)}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#15803D] bg-[#DCFCE7]/40 ring-2 ring-[#15803D] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                            : 'bg-slate-100 text-[#4B5563] border-slate-200'
                        }`}
                      >
                        <CropIcon size={20} />
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-[#15803D]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#1F2937] text-sm">{crop.name}</h3>
                      <p className="text-xs text-[#4B5563] mt-1 font-semibold">
                        MSP: <strong className="text-[#166534]">₹{crop.msp}</strong> / {t('common.quintals')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider">
              {t('farmer.cropQuantity')}
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="number"
                min="1"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-48 border border-slate-300 rounded-xl px-4 py-2.5 text-sm sm:text-base font-extrabold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                required
              />
              <span className="text-xs sm:text-sm font-bold text-[#4B5563]">
                {t('common.quintals')} (Metric Tons: {(quantity / 10).toFixed(1)} MT)
              </span>
            </div>
            <p className="text-xs text-[#4B5563]">
              * Standard government MSP estimate: ₹
              {(
                quantity * (crops.find((c) => c.name === selectedCrop)?.msp || 2275)
              ).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
              icon={<ArrowRight size={16} />}
            >
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: MANDI SELECTION */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider mb-3">
              {t('farmer.wizardStep2')}
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              {centres.map((c) => {
                const isSelected = selectedCentre?._id === c._id;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setSelectedCentre(c)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#15803D] bg-[#DCFCE7]/40 ring-2 ring-[#15803D] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-[#166534] text-xs bg-[#DCFCE7] px-2.5 py-1 rounded-md border border-[#86EFAC]">
                        {c.centreCode}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 size={18} className="text-[#15803D]" />
                      ) : c.distanceKm !== undefined ? (
                        <span className="text-xs font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#86EFAC]">
                          {c.distanceKm} km away
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-extrabold text-[#1F2937] text-base">{c.name}</h3>
                    <p className="text-xs text-[#4B5563] mt-1">{c.address}</p>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#4B5563]">
                      <span>{t('common.time')}: {c.operatingHours.open} - {c.operatingHours.close}</span>
                      <span>Cap: {c.capacityPerDay} {t('common.quintals')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(1)}
              icon={<ArrowLeft size={16} />}
            >
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
              icon={<ArrowRight size={16} />}
            >
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME SLOT */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider mb-2">
              Select Procurement Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#4B5563] uppercase tracking-wider mb-3">
              {t('farmer.wizardStep3')} ({slots.length} available)
            </label>

            {slots.length === 0 ? (
              <EmptyState
                icon={<Clock size={28} />}
                title="No available slots for this date"
                description="Please pick another date or contact Mandi yard administration."
              />
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {slots.map((s) => {
                  const isSelected = selectedSlot?._id === s._id;
                  const isFull = s.remainingCapacity <= 0;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                        isFull
                          ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#15803D] bg-[#DCFCE7]/40 ring-2 ring-[#15803D] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-black text-sm text-[#1F2937]">
                          {s.startTime} - {s.endTime}
                        </span>
                        {isSelected && <CheckCircle2 size={16} className="text-[#15803D]" />}
                      </div>
                      <p className="text-xs text-[#4B5563] font-semibold">
                        {isFull ? (
                          <span className="text-rose-600 font-bold">Slot Full</span>
                        ) : (
                          <span>{s.remainingCapacity} spots remaining</span>
                        )}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(2)}
              icon={<ArrowLeft size={16} />}
            >
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={isLoading || !selectedSlot}
              isLoading={isLoading}
              onClick={handleConfirmBooking}
              icon={<CheckCircle2 size={16} />}
            >
              {t('farmer.confirmBooking')}
            </Button>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 border border-emerald-200">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} className="text-[#15803D]" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full">
                {t('farmer.bookingSuccessTitle')}
              </span>
              <h2 className="text-3xl font-black text-[#1F2937] mt-2 font-mono tracking-tight">
                {bookingSuccess.tokenNumber}
              </h2>
              <p className="text-xs text-[#4B5563] mt-1 font-semibold">
                {t('farmer.bookingSuccessMsg')}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
              <QRCodeSVG
                value={`PROCUREX_TOKEN:${bookingSuccess.tokenNumber}|${bookingSuccess.scheduledDate}|${bookingSuccess.cropType}`}
                size={140}
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-[#1F2937] text-left space-y-1 border border-slate-200">
              <p>
                <strong className="text-[#4B5563]">{t('common.mandi')}:</strong> {selectedCentre?.name}
              </p>
              <p>
                <strong className="text-[#4B5563]">{t('common.date')}:</strong> {bookingSuccess.scheduledDate} (
                {selectedSlot?.startTime} - {selectedSlot?.endTime})
              </p>
              <p>
                <strong className="text-[#4B5563]">{t('common.crop')}:</strong> {bookingSuccess.requestedQuantity} {bookingSuccess.unit}{' '}
                {bookingSuccess.cropType}
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/farmer/live-queue')}
                className="flex-1"
                icon={<Radio size={14} className="animate-pulse" />}
              >
                {t('nav.myQueue')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/farmer')}
              >
                {t('nav.dashboard')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
