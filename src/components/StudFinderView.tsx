import React, { useState } from 'react';
import { MagnetometerReading } from '../types';
import { Target, Layers, ArrowUpDown, Volume2, ShieldAlert, Sparkles } from 'lucide-react';

interface StudFinderViewProps {
  reading: MagnetometerReading;
  threshold: number;
  isAlert: boolean;
  onTare: () => void;
  tareOffset: number;
}

export const StudFinderView: React.FC<StudFinderViewProps> = ({
  reading,
  threshold,
  isAlert,
  onTare,
  tareOffset,
}) => {
  const [wallMaterial, setWallMaterial] = useState<'drywall' | 'metal_stud' | 'conduit'>('drywall');

  // Baseline ambient is 45 µT
  const baseline = tareOffset > 0 ? tareOffset : 46.5;
  const deltaFlux = Math.max(0, reading.magnitude - baseline);
  
  // Proximity factor: 0% at ambient, 100% at or above threshold
  const proximityPercent = Math.min(100, Math.round((reading.magnitude / threshold) * 100));

  // Determine dynamic status
  const getStatus = () => {
    if (isAlert) return { text: 'STUD / METAL DETECTED!', color: '#FF3E3E', bg: '#FF3E3E20' };
    if (reading.magnitude >= 40 && reading.magnitude <= 50) {
      return { text: 'NORMAL WALL BACKGROUND (40–50 µT)', color: '#00FF41', bg: '#00FF4115' };
    }
    if (reading.magnitude > 50) {
      return { text: 'STUD IN PROXIMITY (Approaching)', color: '#FFA500', bg: '#FFA50015' };
    }
    return { text: 'LOW BACKGROUND FIELD', color: '#8E92A0', bg: '#252834' };
  };

  const status = getStatus();

  return (
    <div className="flex-1 w-full p-4 flex flex-col items-center justify-between gap-3 font-mono">
      {/* Dynamic Descriptive Status Placard */}
      <div
        id="stud-status-banner"
        style={{ borderColor: status.color, backgroundColor: status.bg }}
        className={`w-full max-w-md p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
          isAlert ? 'animate-pulse shadow-[0_0_25px_rgba(255,62,62,0.3)]' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: status.color }}
            className={`w-2 h-2 rounded-full ${isAlert ? 'animate-ping' : ''}`}
          />
          <span style={{ color: status.color }} className="tracking-wide">
            {status.text}
          </span>
        </div>
        <span className="text-[10px] text-[#A0A4B0] uppercase">
          {isAlert ? 'ALARM ON' : `${threshold} µT`}
        </span>
      </div>

      {/* Stud Center Target Locator (Visualizer) */}
      <div className="relative w-64 h-64 rounded-full bg-[#12141A] border-2 border-[#232630] flex items-center justify-center p-4 my-2 shadow-inner overflow-hidden">
        {/* Wall Texture Crosshairs */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#2A2E3C]" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#2A2E3C]" />

        {/* Concentric Radar Rings */}
        <div className="absolute w-48 h-48 rounded-full border border-[#232630]" />
        <div className="absolute w-32 h-32 rounded-full border border-[#2A2E3C]" />
        <div className="absolute w-16 h-16 rounded-full border border-[#3A3F50]" />

        {/* Dynamic Stud Proximity Pulse */}
        <div
          style={{
            transform: `scale(${Math.max(0.2, proximityPercent / 100)})`,
            backgroundColor: isAlert ? 'rgba(255,62,62,0.35)' : 'rgba(61,220,132,0.25)',
            borderColor: isAlert ? '#FF3E3E' : '#3DDC84',
          }}
          className="absolute w-40 h-40 rounded-full border-2 transition-transform duration-100 flex items-center justify-center"
        >
          <div
            style={{
              backgroundColor: isAlert ? '#FF3E3E' : '#3DDC84',
            }}
            className="w-3.5 h-3.5 rounded-full shadow-lg"
          />
        </div>

        {/* Center Target Icon */}
        <Target
          className={`w-8 h-8 z-10 transition-colors ${
            isAlert ? 'text-[#FF3E3E] animate-spin' : 'text-[#3DDC84]'
          }`}
        />

        {/* Center alignment text */}
        <div className="absolute bottom-3 text-[10px] font-mono font-bold text-[#E0E0E0] bg-[#171A22]/90 px-2 py-0.5 rounded border border-[#2A2E3C]">
          {isAlert ? 'STUD CENTER LOCKED' : `PROXIMITY: ${proximityPercent}%`}
        </div>
      </div>

      {/* Differential Flux Readout */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-[#15171D] border border-[#232630] flex flex-col">
          <span className="text-[10px] text-[#8E92A0] uppercase">Combined Flux</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-bold ${isAlert ? 'text-[#FF3E3E]' : 'text-white'}`}>
              {reading.magnitude.toFixed(1)}
            </span>
            <span className="text-xs text-[#3DDC84] font-bold">µT</span>
          </div>
          <span className="text-[9px] text-[#6A6E7A] mt-0.5">sqrt(x² + y² + z²)</span>
        </div>

        <div className="p-3 rounded-xl bg-[#15171D] border border-[#232630] flex flex-col">
          <span className="text-[10px] text-[#8E92A0] uppercase">Delta Above Baseline</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-[#3DDC84]">
              +{deltaFlux.toFixed(1)}
            </span>
            <span className="text-xs text-[#8E92A0]">µT</span>
          </div>
          <span className="text-[9px] text-[#6A6E7A] mt-0.5">
            Base: {baseline.toFixed(1)} µT
          </span>
        </div>
      </div>

      {/* Wall Material Preset Tabs */}
      <div className="w-full max-w-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#8E92A0]">
          <span>Wall Material Scanning Profile:</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#15171D] border border-[#232630]">
          {[
            { id: 'drywall', label: 'Drywall Screw' },
            { id: 'metal_stud', label: 'Metal Stud' },
            { id: 'conduit', label: 'AC Conduit' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setWallMaterial(item.id as 'drywall' | 'metal_stud' | 'conduit')}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer truncate ${
                wallMaterial === item.id
                  ? 'bg-[#2A2E3C] text-white shadow-sm'
                  : 'text-[#6A6E7A] hover:text-[#E0E0E0]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calibrate Wall Baseline Button */}
      <button
        id="calibrate-wall-btn"
        onClick={onTare}
        className="w-full max-w-md py-2.5 px-4 rounded-xl bg-[#1C1F28] hover:bg-[#262A36] text-white border border-[#2E3342] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99]"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#3DDC84]" />
        <span>{tareOffset > 0 ? 'RESET WALL BASELINE' : 'CALIBRATE ON CLEAR WALL (ZERO BASE)'}</span>
      </button>
    </div>
  );
};
