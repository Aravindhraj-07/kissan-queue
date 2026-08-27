import React, { useState } from 'react';
import { simulatorApi } from '../../services/api';
import { Smartphone, Send, RotateCcw, X, MessageSquare, PhoneCall } from 'lucide-react';
import { Button } from '../common/Button';

interface SmsUssdSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsUssdSimulatorModal: React.FC<SmsUssdSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'SMS' | 'USSD'>('SMS');

  // SMS state
  const [smsPhone, setSmsPhone] = useState('9876500001');
  const [smsInput, setSmsInput] = useState('BOOK PC-KNL-01 Wheat 25');
  const [smsLogs, setSmsLogs] = useState<Array<{ sender: 'farmer' | 'system'; text: string; time: string }>>([
    {
      sender: 'system',
      text: 'ProcureX SMS Gateway Initialized. Send "BOOK <CENTRE> <CROP> <QTY>" or "STATUS <TOKEN>".',
      time: '10:00 AM',
    },
  ]);
  const [isSmsLoading, setIsSmsLoading] = useState(false);

  // USSD state
  const [ussdPhone, setUssdPhone] = useState('9876500001');
  const [ussdSessionId] = useState('USS-' + Math.floor(Math.random() * 100000));
  const [ussdInput, setUssdInput] = useState('*999*26032#');
  const [ussdCurrentScreen, setUssdCurrentScreen] = useState<string | null>(null);
  const [ussdHistory, setUssdHistory] = useState<string[]>([]);
  const [isUssdLoading, setIsUssdLoading] = useState(false);
  const [ussdUserInput, setUssdUserInput] = useState('');

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const userMsg = smsInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSmsLogs((prev) => [...prev, { sender: 'farmer', text: userMsg, time: timeStr }]);
    setSmsInput('');
    setIsSmsLoading(true);

    try {
      const res = await simulatorApi.sendSms(smsPhone, userMsg);
      setSmsLogs((prev) => [
        ...prev,
        { sender: 'system', text: res.data.reply, time: timeStr },
      ]);
    } catch (err: any) {
      setSmsLogs((prev) => [
        ...prev,
        { sender: 'system', text: 'Error communicating with SMS Gateway.', time: timeStr },
      ]);
    } finally {
      setIsSmsLoading(false);
    }
  };

  const handleStartUssd = async () => {
    setIsUssdLoading(true);
    setUssdHistory([]);
    try {
      const res = await simulatorApi.sendUssd(ussdSessionId, ussdPhone, '');
      setUssdCurrentScreen(res.data.response);
    } catch (err: any) {
      setUssdCurrentScreen('END Error connecting to USSD Gateway.');
    } finally {
      setIsUssdLoading(false);
    }
  };

  const handleUssdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ussdUserInput.trim()) return;

    const nextCode = [...ussdHistory, ussdUserInput.trim()].join('*');
    setIsUssdLoading(true);

    try {
      const res = await simulatorApi.sendUssd(ussdSessionId, ussdPhone, nextCode);
      setUssdHistory((prev) => [...prev, ussdUserInput.trim()]);
      setUssdCurrentScreen(res.data.response);
      setUssdUserInput('');
    } catch (err: any) {
      setUssdCurrentScreen('END USSD Network Timeout.');
    } finally {
      setIsUssdLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#14532D] text-white px-6 py-4 flex items-center justify-between border-b border-[#166534]">
          <div className="flex items-center space-x-2.5">
            <Smartphone size={20} className="text-[#86EFAC]" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Offline Farmer Channel Simulator</h3>
              <p className="text-[11px] text-emerald-200 font-medium">SIH 2026 Non-Internet Feature Phone Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white transition active:scale-95 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('SMS')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'SMS'
                ? 'bg-white text-[#15803D] shadow-2xs'
                : 'text-[#4B5563] hover:text-[#1F2937]'
            }`}
          >
            <MessageSquare size={14} />
            <span>SMS Booking Gateway</span>
          </button>
          <button
            onClick={() => setActiveTab('USSD')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'USSD'
                ? 'bg-white text-[#15803D] shadow-2xs'
                : 'text-[#4B5563] hover:text-[#1F2937]'
            }`}
          >
            <PhoneCall size={14} />
            <span>USSD Menu (*999*26032#)</span>
          </button>
        </div>

        {/* Phone Body Simulation */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'SMS' ? (
            <div className="space-y-4">
              {/* Sender Info Bar */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-[#1F2937]">
                <span>SIM Phone: <strong className="font-mono">+91 {smsPhone}</strong></span>
                <span className="text-[#166534] font-bold bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-0.5 rounded-full">
                  GSM 2G Channel Active
                </span>
              </div>

              {/* SMS Messages View */}
              <div className="h-64 bg-slate-900 rounded-2xl p-4 overflow-y-auto space-y-3 font-sans text-xs flex flex-col border border-slate-800">
                {smsLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      log.sender === 'farmer'
                        ? 'bg-[#15803D] text-white self-end rounded-br-xs'
                        : 'bg-slate-800 text-[#86EFAC] self-start border border-slate-700 rounded-bl-xs'
                    }`}
                  >
                    <p>{log.text}</p>
                    <span className="block text-[9px] opacity-70 mt-1 text-right font-mono">{log.time}</span>
                  </div>
                ))}
                {isSmsLoading && (
                  <div className="bg-slate-800 text-slate-400 p-2.5 rounded-xl self-start text-xs animate-pulse">
                    ProcureX SMS Gateway processing command...
                  </div>
                )}
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSmsInput('BOOK PC-KNL-01 Wheat 35')}
                  className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#1F2937] font-semibold px-3 py-1 rounded-full border border-slate-200 transition cursor-pointer"
                >
                  Quick: Book Karnal Wheat
                </button>
                <button
                  type="button"
                  onClick={() => setSmsInput('BOOK PC-KHN-02 Paddy 50')}
                  className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#1F2937] font-semibold px-3 py-1 rounded-full border border-slate-200 transition cursor-pointer"
                >
                  Quick: Book Khanna Paddy
                </button>
                <button
                  type="button"
                  onClick={() => setSmsInput('STATUS TK-KNL-0002')}
                  className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#1F2937] font-semibold px-3 py-1 rounded-full border border-slate-200 transition cursor-pointer"
                >
                  Quick: Status TK-KNL-0002
                </button>
              </div>

              {/* SMS Input Form */}
              <form onSubmit={handleSendSms} className="flex space-x-2">
                <input
                  type="text"
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  placeholder="Type SMS command e.g. BOOK PC-KNL-01 Wheat 25"
                  className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#15803D] font-mono text-[#1F2937]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSmsLoading}
                  isLoading={isSmsLoading}
                  icon={<Send size={13} />}
                >
                  Send
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-[#1F2937]">
                <span>USSD Code: <strong className="font-mono font-bold">*999*26032#</strong></span>
                <button
                  onClick={handleStartUssd}
                  className="text-[#15803D] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Restart Session</span>
                </button>
              </div>

              {/* USSD Dialog Screen */}
              <div className="h-64 bg-slate-900 text-[#86EFAC] rounded-2xl p-5 font-mono text-xs flex flex-col justify-between border-4 border-slate-800 shadow-inner">
                {ussdCurrentScreen ? (
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto">
                    {ussdCurrentScreen}
                  </pre>
                ) : (
                  <div className="text-center my-auto space-y-3">
                    <p className="text-slate-400">Ready to simulate interactive USSD menu on 2G feature phone</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleStartUssd}
                      disabled={isUssdLoading}
                      isLoading={isUssdLoading}
                    >
                      Dial *999*26032#
                    </Button>
                  </div>
                )}

                {ussdCurrentScreen?.startsWith('CON') && (
                  <form onSubmit={handleUssdSubmit} className="mt-3 flex space-x-2 pt-2 border-t border-slate-700">
                    <input
                      type="text"
                      value={ussdUserInput}
                      onChange={(e) => setUssdUserInput(e.target.value)}
                      placeholder="Enter menu option number..."
                      className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none font-mono"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isUssdLoading}
                    >
                      Send
                    </Button>
                  </form>
                )}
              </div>

              <div className="text-xs text-[#4B5563] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-[#1F2937]">How USSD Works:</span> Operates on standard feature phones over GSM signal without 4G data or internet, interfacing directly with the ProcureX core booking engine.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
