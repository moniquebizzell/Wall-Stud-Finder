import React from 'react';
import { Volume2, VolumeX, Vibrate, VibrateOff, Target, Sliders } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ControlPanelProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  threshold: number;
  onChangeThreshold: (val: number) => void;
  tareOffset: number;
  onTare: () => void;
  isAlert: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  audioEnabled,
  onToggleAudio,
  hapticsEnabled,
  onToggleHaptics,
  threshold,
  onChangeThreshold,
  tareOffset,
  onTare,
  isAlert,
}) => {
  return (
    <div
      id="control-panel"
      className="w-full max-w-md mx-auto p-4 rounded-xl bg-[#15171D] border border-[#2A2D35] flex flex-col gap-3.5 select-none transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
    >
      {/* Header with Title & Audio Test */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase text-[#6A6E7A] tracking-wider font-bold font-mono flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#6A6E7A]" />
          Instrument Controls
        </span>

        {/* Audio Test Beep Button */}
        <button
          id="test-beep-btn"
          onClick={() => soundManager.playBeep(1100, 0.15)}
          className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#2A2D35] hover:bg-[#353942] text-[#E0E0E0] border border-[#3A3E4A]/60 transition-colors uppercase cursor-pointer"
        >
          Test Signal
        </button>
      </div>

      {/* 3 Hardware Switches styled after Recipe 3 buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Audio Toggle */}
        <button
          id="toggle-audio-btn"
          onClick={onToggleAudio}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
            audioEnabled
              ? 'bg-[#2A2D35] text-[#E0E0E0] border-[#3A3E4A] hover:bg-[#353942]'
              : 'bg-[#1A1C23] text-[#6A6E7A] border-[#2A2D35] hover:text-[#E0E0E0]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${audioEnabled ? 'bg-[#00FF41]' : 'bg-[#6A6E7A]'}`} />
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-[#E0E0E0]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#6A6E7A]" />
            )}
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">AUDIO</span>
          <span className="text-[9px] font-mono text-[#6A6E7A]">
            {audioEnabled ? 'BEEP ON' : 'MUTED'}
          </span>
        </button>

        {/* Haptics Toggle */}
        <button
          id="toggle-haptics-btn"
          onClick={onToggleHaptics}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
            hapticsEnabled
              ? 'bg-[#2A2D35] text-[#E0E0E0] border-[#3A3E4A] hover:bg-[#353942]'
              : 'bg-[#1A1C23] text-[#6A6E7A] border-[#2A2D35] hover:text-[#E0E0E0]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${hapticsEnabled ? 'bg-[#00FF41]' : 'bg-[#6A6E7A]'}`} />
            {hapticsEnabled ? (
              <Vibrate className="w-4 h-4 text-[#E0E0E0]" />
            ) : (
              <VibrateOff className="w-4 h-4 text-[#6A6E7A]" />
            )}
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">HAPTIC</span>
          <span className="text-[9px] font-mono text-[#6A6E7A]">
            {hapticsEnabled ? 'ACTIVE' : 'OFF'}
          </span>
        </button>

        {/* Tare / Ground Balance Baseline */}
        <button
          id="tare-btn"
          onClick={onTare}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
            tareOffset > 0
              ? 'bg-[#FF3E3E] text-[#000000] border-[#FF3E3E] font-bold shadow-[0_0_15px_rgba(255,62,62,0.3)]'
              : 'bg-[#2A2D35] text-[#E0E0E0] border-[#3A3E4A] hover:bg-[#353942]'
          }`}
          title="Zero out current ambient field to measure relative anomalies"
        >
          <Target className={`w-4 h-4 mb-1 ${tareOffset > 0 ? 'text-[#000000]' : 'text-[#E0E0E0]'}`} />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">BALANCE</span>
          <span className={`text-[9px] font-mono ${tareOffset > 0 ? 'text-[#000000]/80' : 'text-[#6A6E7A]'}`}>
            {tareOffset > 0 ? 'ZEROED' : 'CALIBRATE'}
          </span>
        </button>
      </div>

      {/* Threshold Slider */}
      <div className="pt-3 border-t border-[#2A2D35]">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-[#6A6E7A]">ALERT THRESHOLD</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#FF3E3E] font-mono">{threshold} µT</span>
            {threshold !== 70 && (
              <button
                onClick={() => onChangeThreshold(70)}
                className="text-[9px] text-[#6A6E7A] hover:text-[#E0E0E0] underline cursor-pointer"
              >
                Reset 70 µT
              </button>
            )}
          </div>
        </div>
        <input
          id="threshold-slider"
          type="range"
          min="55"
          max="120"
          step="1"
          value={threshold}
          onChange={(e) => onChangeThreshold(Number(e.target.value))}
          className="w-full accent-[#FF3E3E] cursor-pointer h-1.5 bg-[#1A1C23] rounded-full appearance-none"
        />
        <div className="flex justify-between text-[9px] font-mono text-[#6A6E7A] mt-1">
          <span>55 µT (High Gain)</span>
          <span className="text-[#E0E0E0] font-bold">Default: 70 µT</span>
          <span>120 µT (Deep Ferrous)</span>
        </div>
      </div>
    </div>
  );
};
