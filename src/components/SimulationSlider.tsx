import React from 'react';
import { Magnet } from 'lucide-react';

interface SimulationSliderProps {
  proximity: number; // 0 to 100
  onChangeProximity: (val: number) => void;
  isAlert: boolean;
  threshold: number;
}

export const SimulationSlider: React.FC<SimulationSliderProps> = ({
  proximity,
  onChangeProximity,
  isAlert,
  threshold,
}) => {
  return (
    <div
      id="simulation-testing-card"
      className={`w-full max-w-md mx-auto p-4 rounded-xl bg-[#15171D] border transition-all select-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col gap-3 ${
        isAlert ? 'border-[#FF3E3E]/60' : 'border-[#2A2D35]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#6A6E7A] font-bold">
          <Magnet className={`w-3.5 h-3.5 ${isAlert ? 'text-[#FF3E3E]' : 'text-[#6A6E7A]'}`} />
          <span>Proximity Simulator // Test</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#E0E0E0]">
          {proximity === 0 ? 'Ambient (0%)' : `${proximity}% Target Proximity`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-[#6A6E7A] shrink-0">Ambient (~45 µT)</span>
        <input
          id="proximity-slider"
          type="range"
          min="0"
          max="100"
          step="1"
          value={proximity}
          onChange={(e) => onChangeProximity(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#FF3E3E] bg-[#1A1C23]"
        />
        <span className="text-[10px] font-mono text-[#FF3E3E] font-bold shrink-0">
          Near (&gt;{threshold} µT)
        </span>
      </div>

      {/* Quick Hardware Presets */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={() => onChangeProximity(0)}
          className={`flex-1 py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
            proximity === 0
              ? 'bg-[#E0E0E0] text-[#000000] border-[#E0E0E0]'
              : 'bg-[#2A2D35] hover:bg-[#353942] text-[#E0E0E0] border-[#3A3E4A]/50'
          }`}
        >
          Baseline
        </button>
        <button
          onClick={() => onChangeProximity(35)}
          className={`flex-1 py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
            proximity === 35
              ? 'bg-[#E0E0E0] text-[#000000] border-[#E0E0E0]'
              : 'bg-[#2A2D35] hover:bg-[#353942] text-[#E0E0E0] border-[#3A3E4A]/50'
          }`}
        >
          Weak 60µT
        </button>
        <button
          onClick={() => onChangeProximity(65)}
          className={`flex-1 py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
            proximity >= 60 && proximity < 90
              ? 'bg-[#FF3E3E] text-[#000000] border-[#FF3E3E] shadow-[0_0_12px_rgba(255,62,62,0.3)]'
              : 'bg-[#2A2D35] hover:bg-[#353942] text-[#FF3E3E] border-[#3A3E4A]/50'
          }`}
        >
          Detect &gt;70µT
        </button>
        <button
          onClick={() => onChangeProximity(100)}
          className={`flex-1 py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
            proximity === 100
              ? 'bg-[#FF3E3E] text-[#000000] border-[#FF3E3E] shadow-[0_0_15px_rgba(255,62,62,0.4)]'
              : 'bg-[#2A2D35] hover:bg-[#353942] text-[#E0E0E0] border-[#3A3E4A]/50'
          }`}
        >
          Max (100%)
        </button>
      </div>

      <p className="text-[10px] text-[#6A6E7A] font-mono leading-tight">
        Simulates bringing a ferrous metal target near the internal sensor to evaluate real-time continuous haptic feedback and alert sirens.
      </p>
    </div>
  );
};
