import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IProcurement } from '../../types';
import { Printer, CheckCircle2, X, ShieldCheck, Sprout, Building2 } from 'lucide-react';
import { Button } from './Button';

interface DigitalSlipModalProps {
  procurement: IProcurement | null;
  onClose: () => void;
}

export const DigitalSlipModal: React.FC<DigitalSlipModalProps> = ({ procurement, onClose }) => {
  if (!procurement) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="bg-[#14532D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#166534] flex items-center justify-center font-bold text-lg border border-emerald-600 shadow-2xs">
              <Sprout size={20} className="text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Official Procurement Receipt</h3>
              <p className="text-xs text-emerald-200 font-mono font-semibold">
                SLIP #{procurement.digitalSlipNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-[#166534] transition active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Slip Body */}
        <div className="p-6 space-y-5 print:p-8" id="printable-slip">
          {/* Gov emblem and branding */}
          <div className="text-center border-b border-slate-200 pb-4 space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full">
              Government of India • MSP Procurement System
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#1F2937] mt-2">
              National Agricultural Mandi e-Weighbridge Slip
            </h2>
            <p className="text-xs text-[#4B5563] font-medium">
              Issued at: {procurement.centreId?.name} ({procurement.centreId?.centreCode})
            </p>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[#4B5563] block text-xs font-semibold">Farmer Beneficiary:</span>
              <span className="font-extrabold text-[#1F2937] text-sm block mt-0.5">
                {procurement.farmerId?.name || 'Farmer'}
              </span>
              <span className="text-[#4B5563] block mt-0.5 font-mono text-xs">
                Phone: {procurement.farmerId?.phone}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[#4B5563] block text-xs font-semibold">Transaction Timestamp:</span>
              <span className="font-bold text-[#1F2937] block mt-0.5">
                {new Date(procurement.timestamp).toLocaleString('en-IN')}
              </span>
              <span className="text-[#166534] font-bold block mt-0.5 flex items-center text-xs">
                <CheckCircle2 size={13} className="mr-1" /> MSP Direct Verified
              </span>
            </div>
          </div>

          {/* Produce Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[#1F2937] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Crop Produce</th>
                  <th className="p-3.5 text-center">Grade</th>
                  <th className="p-3.5 text-center">Moisture</th>
                  <th className="p-3.5 text-right">Net Weight</th>
                  <th className="p-3.5 text-right">MSP Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5 font-bold text-[#1F2937]">{procurement.cropType}</td>
                  <td className="p-3.5 text-center">
                    <span className="bg-[#DCFCE7] text-[#166534] font-extrabold px-2 py-0.5 rounded text-xs border border-[#86EFAC]">
                      {procurement.qualityGrade}
                    </span>
                  </td>
                  <td className="p-3.5 text-center text-[#1F2937] font-semibold">{procurement.moisturePercent}%</td>
                  <td className="p-3.5 text-right font-black text-[#1F2937]">
                    {procurement.actualQuantity} {procurement.unit}
                  </td>
                  <td className="p-3.5 text-right text-[#4B5563] font-semibold">
                    ₹{procurement.mspPricePerQuintal} / {procurement.unit}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total Payout Summary */}
            <div className="bg-[#DCFCE7]/60 p-4 border-t border-[#86EFAC] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#166534] font-bold block">
                  Total Direct Benefit Transfer (DBT) Payout:
                </span>
                <p className="text-xs text-[#4B5563]">Credited to registered Aadhaar-linked Bank A/C</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#166534]">
                  ₹{procurement.totalPayout.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Security Stamp */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3.5">
              <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-2xs shrink-0">
                <QRCodeSVG
                  value={`PROCUREX_RECEIPT:${procurement.digitalSlipNumber}|${procurement.totalPayout}|${procurement.actualQuantity}`}
                  size={70}
                />
              </div>
              <div className="text-xs text-[#4B5563] space-y-0.5">
                <p className="font-bold text-[#1F2937] flex items-center">
                  <ShieldCheck size={15} className="text-[#15803D] mr-1" /> Cryptographically Validated
                </p>
                <p className="font-mono text-xs text-[#1F2937] font-bold">{procurement.digitalSlipNumber}</p>
                <p className="text-[11px] text-[#4B5563]">Scan at Gate for logistics handover</p>
              </div>
            </div>
            <div className="text-right text-xs text-[#4B5563]">
              <p className="font-bold text-[#1F2937]">Mandi Secretary Desk</p>
              <p className="text-[11px]">Digitally Certified by Mandi Officer</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer size={15} />}
          >
            Print / Save Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
