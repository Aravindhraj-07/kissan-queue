/**
 * Generates a unique, human-readable token number for Mandi slot bookings.
 * Format: TK-<CENTRE_CODE_OR_DISTRICT>-<SERIAL> e.g. TK-KNL-1042
 */
export const generateTokenNumber = (centreCode: string, sequenceNumber: number): string => {
  const codePrefix = (centreCode || 'MND').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);
  const formattedSeq = sequenceNumber.toString().padStart(4, '0');
  return `TK-${codePrefix}-${formattedSeq}`;
};

/**
 * Generates a unique tracking slip ID for procurement receipts.
 */
export const generateProcurementSlipId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `PRC-${timestamp}-${random}`;
};
