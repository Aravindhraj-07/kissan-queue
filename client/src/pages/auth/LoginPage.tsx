import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide your registered mobile number / email and password.');
      return;
    }

    setError('');
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#15803D] text-white font-black text-2xl shadow-xs border border-emerald-600">
          PX
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight">
          Sign In to Procure<span className="text-[#15803D]">X</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] font-medium">
          National e-Procurement Mandi Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xs rounded-3xl border border-slate-200/90 sm:px-10 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center space-x-2 animate-fadeIn">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                Registered Mobile Number / Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                  <Phone size={16} />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter registered mobile or email"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#1F2937] mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#1F2937] focus:ring-2 focus:ring-[#15803D] focus:outline-none"
                  required
                />
              </div>
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
              Sign In to Account
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#4B5563]">New farmer?</span>
            <Link to="/register" className="font-bold text-[#15803D] hover:text-[#166534] hover:underline">
              Register Farmer Account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#4B5563] flex items-center justify-center space-x-1.5 font-medium">
          <ShieldCheck size={16} className="text-[#15803D]" />
          <span>Encrypted with SHA-256 / Bcrypt • Government Certified Portal</span>
        </div>
      </div>
    </div>
  );
};
