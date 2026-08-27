import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Lock, MapPin, Sprout, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const RegisterPage: React.FC = () => {
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
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#15803D] text-white font-black text-2xl shadow-xs border border-emerald-600">
          PX
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight">
          Farmer Registration Portal
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] font-medium">
          Register to book procurement slots and track digital queue tokens
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
                  Farmer Full Name *
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
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Mobile Number (for SMS Tokens) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-xs font-extrabold text-[#166534] flex items-center space-x-1.5">
                <MapPin size={15} />
                <span>Farm Location Details</span>
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4B5563] mb-1">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Taraori"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4B5563] mb-1">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Karnal"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4B5563] mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Haryana"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#4B5563] mb-1.5 flex items-center space-x-1.5">
                <Sprout size={15} className="text-[#15803D]" />
                <span>Total Farm Land Area (in Acres)</span>
              </label>
              <input
                type="number"
                name="landAreaAcres"
                value={formData.landAreaAcres}
                onChange={handleChange}
                placeholder="e.g. 5"
                step="0.5"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              isLoading={isLoading}
              icon={<ArrowRight size={16} />}
              className="w-full mt-3"
            >
              Complete Registration & Enter
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs sm:text-sm text-[#4B5563]">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#15803D] hover:text-[#166534] hover:underline">
              Sign In here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#4B5563] flex items-center justify-center space-x-1.5 font-medium">
          <ShieldCheck size={16} className="text-[#15803D]" />
          <span>Aadhaar Verified • Ministry of Agriculture Certified</span>
        </div>
      </div>
    </div>
  );
};
