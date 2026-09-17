import React from 'react';
import { MagnetometerReading } from '../types';
import { RotateCcw } from 'lucide-react';

interface DigitalReadoutProps {
  reading: MagnetometerReading;
  peak: number;
  threshold: number;
  onResetPeak: () => void;
  isAlert: boolean;
  tareOffset: number;
}

export const DigitalReadout: React.FC<DigitalReadoutProps> = ({
  reading,
  peak,
  threshold,
  onResetPeak,
  isAlert,
  tareOffset,
}) => {
  // Vector bar percentage calculation (clamped 0 - 100% relative to 100 µT)
  const calcPct = (val: number) => {
    return Math.min(Math.max((Math.abs(val) / 100) * 100, 4), 100);
  };

  const xPct = calcPct(reading.x);
  const yPct = calcPct(reading.y);
  const zPct = calcPct(reading.z);

  return (
    <div
      id="digital-readout-panel"
      className={`w-full max-w-md mx-auto p-4 rounded-xl border transition-all select-none ${
        isAlert
          ? 'bg-[#15171D] border-[#FF3E3E] shadow-[0_0_30px_rgba(255,62,62,0.15)]'
          : 'bg-[#15171D] border-[#2A2D35]'
      }`}
    >
      {/* Panel Header */}
      <div className="flex justify-between items-center mb-3.5">
        <span className="text-[10px] uppercase text-[#6A6E7A] tracking-wider font-bold font-mono">
          Vector Analysis
        </span>
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
          isAlert ? 'bg-[#FF3E3E]/20 text-[#FF3E3E] border border-[#FF3E3E]/50 animate-pulse' : 'bg-[#2A2D35] text-[#E0E0E0]'
        }`}>
          {isAlert ? 'ANOMALY DETECTED' : 'LOCKED'}
        </span>
      </div>

      {/* 3-Axis Vector Breakdown matching Recipe 3 style */}
      <div className="space-y-3 font-mono">
        {/* X-Axis */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6A6E7A]">X-AXIS (Bx)</span>
            <span className="text-[#E0E0E0] font-bold">
              {reading.x >= 0 ? `+${reading.x.toFixed(1)}` : reading.x.toFixed(1)} µT
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1A1C23] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                Math.abs(reading.x) >= threshold * 0.7 ? 'bg-[#FF3E3E]' : 'bg-[#FFFFFF] opacity-25'
              }`}
              style={{ width: `${xPct}%` }}
            />
          </div>
        </div>

        {/* Y-Axis */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6A6E7A]">Y-AXIS (By)</span>
            <span className="text-[#E0E0E0] font-bold">
              {reading.y >= 0 ? `+${reading.y.toFixed(1)}` : reading.y.toFixed(1)} µT
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1A1C23] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                Math.abs(reading.y) >= threshold * 0.7 ? 'bg-[#FF3E3E]' : 'bg-[#FFFFFF] opacity-25'
              }`}
              style={{ width: `${yPct}%` }}
            />
          </div>
        </div>

        {/* Z-Axis */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6A6E7A]">Z-AXIS (Bz)</span>
            <span className="text-[#E0E0E0] font-bold">
              {reading.z >= 0 ? `+${reading.z.toFixed(1)}` : reading.z.toFixed(1)} µT
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1A1C23] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                Math.abs(reading.z) >= threshold * 0.7 ? 'bg-[#FF3E3E]' : 'bg-[#FFFFFF] opacity-25'
              }`}
              style={{ width: `${zPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Peak Detected & Alert Limit */}
      <div className="mt-4 pt-3 border-t border-[#2A2D35] flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[#6A6E7A]">Peak Detected</span>
          <span className={`font-bold font-mono ${peak >= threshold ? 'text-[#FF3E3E]' : 'text-[#FFFFFF]'}`}>
            {peak.toFixed(1)} µT
          </span>
          <button
            id="reset-peak-btn"
            onClick={onResetPeak}
            title="Reset Peak Value"
            className="p-1 rounded hover:bg-[#2A2D35] text-[#6A6E7A] hover:text-[#E0E0E0] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#6A6E7A]">Threshold</span>
          <span className="px-1.5 py-0.5 rounded bg-[#2A2D35] text-[#FF3E3E] font-bold border border-[#3A3E4A]">
            {threshold} µT
          </span>
        </div>
      </div>

      {tareOffset > 0 && (
        <div className="mt-2 text-center text-[10px] font-mono text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/30 py-0.5 rounded">
          TARE CALIBRATION ACTIVE: -{tareOffset.toFixed(1)} µT
        </div>
      )}
    </div>
  );
};
