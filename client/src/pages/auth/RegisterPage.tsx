import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Lock, MapPin, Sprout, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    village: '',
    district: '',
    state: '',
    landAreaAcres: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setError('');
    try {
      await register({
        ...formData,
        role: 'FARMER',
      });
      navigate('/farmer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Language Bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8">
        <LanguageSelector variant="header" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#15803D] text-white font-black text-2xl shadow-xs border border-emerald-600">
          PX
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight">
          {t('auth.registerTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] font-medium">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xs rounded-3xl border border-slate-200/90 sm:px-10 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center space-x-2 animate-fadeIn">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t('auth.fullName')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sardar Gurpreet Singh"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t('auth.mobileNumber')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876500001"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t('auth.passwordLabel')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t('auth.village')}
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="Village / Town"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t('auth.district')}
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t('auth.state')}
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t('auth.landArea')}
              </label>
              <input
                type="number"
                name="landAreaAcres"
                value={formData.landAreaAcres}
                onChange={handleChange}
                placeholder="e.g. 5.5"
                step="0.1"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              isLoading={isLoading}
              icon={<ArrowRight size={16} />}
              className="w-full mt-2"
            >
              {t('auth.registerTitle')}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#4B5563]">{t('auth.alreadyRegistered')}</span>
            <Link to="/login" className="font-bold text-[#15803D] hover:text-[#166534] hover:underline">
              {t('auth.loginLink')}
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#4B5563] flex items-center justify-center space-x-1.5 font-medium">
          <ShieldCheck size={16} className="text-[#15803D]" />
          <span>{t('app.encrypted')}</span>
        </div>
      </div>
    </div>
  );
};
