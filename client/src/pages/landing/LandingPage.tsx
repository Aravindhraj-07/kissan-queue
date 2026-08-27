import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../services/api';
import { IBooking } from '../../types';
import {
  Search,
  CalendarCheck,
  Radio,
  Truck,
  Building2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Scale,
  Sprout,
  Landmark,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchToken, setSearchToken] = useState('');
  const [tokenResult, setTokenResult] = useState<IBooking | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchToken.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setTokenResult(null);

    try {
      const res = await bookingsApi.getBookingByToken(searchToken.trim());
      if (res.data.success) {
        setTokenResult(res.data.data);
      }
    } catch (err: any) {
      setSearchError(`Token "${searchToken}" was not found in the live registry.`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#1F2937]">
      {/* Top Gov Header */}
      <div className="bg-[#14532D] text-white text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-[#166534]">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold tracking-wide">भारत सरकार | Government of India</span>
          <span className="text-emerald-400">•</span>
          <span className="text-emerald-100 hidden sm:inline">
            {t('app.govtOfIndia')}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-[#FDE047] font-mono font-bold">
          <span>{t('app.sihBadge')}</span>
          <LanguageSelector variant="header" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-[#166534] text-white py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#14532D] border border-emerald-500/50 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#86EFAC] shadow-2xs">
              <Sparkles size={14} className="text-[#FDE047]" />
              <span>{t('app.tagline')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              {t('landing.heroTitle')}
            </h1>

            <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
              {t('landing.heroSubtitle')}
            </p>

            {/* Portal Action Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                to={user?.role === 'FARMER' ? '/farmer' : '/login'}
                className="bg-[#14532D] hover:bg-[#052E16] p-4 rounded-2xl border border-emerald-600/60 text-center transition-all duration-150 flex flex-col items-center justify-center space-y-2 shadow-xs hover:-translate-y-1 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-[#86EFAC] group-hover:scale-110 transition-transform">
                  <Sprout size={20} />
                </div>
                <span className="text-xs font-extrabold text-white">{t('landing.portalFarmerTitle')}</span>
              </Link>

              <Link
                to={user?.role === 'STORAGE_AUTHORITY' ? '/storage' : '/login'}
                className="bg-[#14532D] hover:bg-[#052E16] p-4 rounded-2xl border border-emerald-600/60 text-center transition-all duration-150 flex flex-col items-center justify-center space-y-2 shadow-xs hover:-translate-y-1 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-[#86EFAC] group-hover:scale-110 transition-transform">
                  <Building2 size={20} />
                </div>
                <span className="text-xs font-extrabold text-white">{t('landing.portalStorageTitle')}</span>
              </Link>

              <Link
                to={user?.role === 'LOGISTICS' ? '/logistics' : '/login'}
                className="bg-[#14532D] hover:bg-[#052E16] p-4 rounded-2xl border border-emerald-600/60 text-center transition-all duration-150 flex flex-col items-center justify-center space-y-2 shadow-xs hover:-translate-y-1 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-[#86EFAC] group-hover:scale-110 transition-transform">
                  <Truck size={20} />
                </div>
                <span className="text-xs font-extrabold text-white">{t('landing.portalLogisticsTitle')}</span>
              </Link>

              <Link
                to={user?.role === 'ADMIN' ? '/admin' : '/login'}
                className="bg-[#14532D] hover:bg-[#052E16] p-4 rounded-2xl border border-emerald-600/60 text-center transition-all duration-150 flex flex-col items-center justify-center space-y-2 shadow-xs hover:-translate-y-1 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-[#86EFAC] group-hover:scale-110 transition-transform">
                  <Landmark size={20} />
                </div>
                <span className="text-xs font-extrabold text-white">{t('landing.portalAdminTitle')}</span>
              </Link>
            </div>
          </div>

          {/* Quick Token Search Box */}
          <div className="lg:col-span-5 bg-white text-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 text-[#15803D] font-extrabold mb-1">
              <Radio size={18} className="animate-pulse" />
              <span className="text-xs uppercase tracking-wider">{t('landing.quickLookupTitle')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1F2937] mb-4 tracking-tight">
              {t('landing.quickLookupTitle')}
            </h2>

            <form onSubmit={handleSearchToken} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  placeholder={t('landing.quickLookupPlaceholder')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono uppercase font-bold text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSearching}
                  isLoading={isSearching}
                  icon={<Search size={14} />}
                  className="absolute right-2 top-2"
                >
                  {t('landing.quickLookupBtn')}
                </Button>
              </div>
            </form>

            {searchError && (
              <div className="mt-4 p-3.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200 animate-fadeIn">
                {searchError}
              </div>
            )}

            {tokenResult && (
              <div className="mt-4 p-4 bg-[#DCFCE7]/60 rounded-2xl border border-[#86EFAC] space-y-3 text-xs sm:text-sm animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#86EFAC]/60 pb-2">
                  <span className="font-mono font-black text-[#166534] text-base">
                    {tokenResult.tokenNumber}
                  </span>
                  <Badge status={tokenResult.status} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-[#1F2937]">
                  <div>
                    <span className="text-[#4B5563] block text-xs">{t('common.mandi')}:</span>
                    <span className="font-bold">{tokenResult.centreId?.name}</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-xs">{t('common.crop')}:</span>
                    <span className="font-bold">
                      {tokenResult.requestedQuantity} {tokenResult.unit} {tokenResult.cropType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-xs">{t('common.date')}:</span>
                    <span className="font-bold">{tokenResult.scheduledDate}</span>
                  </div>
                  <div>
                    <span className="text-[#4B5563] block text-xs">{t('common.time')}:</span>
                    <span className="font-bold">
                      {tokenResult.slotId?.startTime} - {tokenResult.slotId?.endTime}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#4B5563]">
              <span className="font-semibold">Need to book a new slot?</span>
              <Link
                to="/farmer/book"
                className="font-bold text-[#15803D] hover:text-[#166534] hover:underline flex items-center space-x-1 transition"
              >
                <span>{t('nav.bookSlot')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12 flex-1">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-extrabold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full">
            {t('landing.featuresTitle')}
          </span>
          <h2 className="text-3xl font-black text-[#1F2937] tracking-tight">
            How ProcureX Transforms Mandi Procurement
          </h2>
          <p className="text-[#4B5563] text-sm font-medium">
            Grounded in SIH 2026 Problem Statement 26032 to eliminate physical crowding and long delays.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 card-interactive">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] flex items-center justify-center shadow-2xs">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">{t('landing.f1Title')}</h3>
            <p className="text-[#4B5563] text-xs sm:text-sm leading-relaxed">
              {t('landing.f1Desc')}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 card-interactive">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] flex items-center justify-center shadow-2xs">
              <Radio size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">{t('landing.f2Title')}</h3>
            <p className="text-[#4B5563] text-xs sm:text-sm leading-relaxed">
              {t('landing.f2Desc')}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 card-interactive">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC] flex items-center justify-center shadow-2xs">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">{t('landing.f3Title')}</h3>
            <p className="text-[#4B5563] text-xs sm:text-sm leading-relaxed">
              {t('landing.f3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#14532D] text-emerald-100 text-xs py-8 px-4 sm:px-8 border-t border-[#166534]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-black text-white text-base">ProcureX</span>
            <span>• Smart Mandi Procurement System (SIH 2026)</span>
          </div>
          <p>© 2026 Ministry of Agriculture & Farmers Welfare, Govt of India.</p>
        </div>
      </footer>
    </div>
  );
};
