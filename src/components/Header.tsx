import React from 'react';
import { SensorStatus } from '../types';
import { RefreshCw, Code2, Compass } from 'lucide-react';

interface HeaderProps {
  sensorStatus: SensorStatus;
  isSimulationMode: boolean;
  onToggleSimulation: () => void;
  onConnectSensor: () => void;
  onOpenCodeModal?: () => void;
  isAlert: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sensorStatus,
  isSimulationMode,
  onToggleSimulation,
  onConnectSensor,
  onOpenCodeModal,
  isAlert,
}) => {
  return (
    <header
      id="app-header"
      className={`w-full px-4 py-3 border-b transition-colors duration-200 sticky top-0 z-20 select-none ${
        isAlert
          ? 'bg-[#15171D]/95 border-[#FF3E3E] shadow-[0_0_25px_rgba(255,62,62,0.2)]'
          : 'bg-[#0A0B0E]/95 border-[#2A2D35]'
      } backdrop-blur-md`}
    >
      <div className="w-full flex items-center justify-between">
        {/* Left: App Title & Android Compass Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1A1D24] border border-[#2A2D35] flex items-center justify-center text-[#E0E0E0]">
            <Compass className={`w-4 h-4 ${isAlert ? 'text-[#FF3E3E] animate-spin' : 'text-[#00FF41]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#FFFFFF] font-mono leading-none">
                MAG-TECH 4000
              </h1>
              <span className="text-[9px] px-1 rounded bg-[#2A2D35] text-[#3DDC84] font-bold font-mono">
                APK v4.2
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#6A6E7A] font-mono mt-0.5">
              Android Flux Utility • µT
            </p>
          </div>
        </div>

        {/* Right: Sensor Status & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-right font-mono">
          {/* Android Studio Code Export (mobile/desktop accessible) */}
          {onOpenCodeModal && (
            <button
              onClick={onOpenCodeModal}
              title="View & Download Android Studio Project"
              className="flex items-center gap-1 py-1 px-2 rounded bg-[#1A1D24] hover:bg-[#252932] text-[#3DDC84] border border-[#3DDC84]/30 text-[10px] font-bold font-mono transition-colors cursor-pointer"
            >
              <Code2 className="w-3 h-3" />
              <span className="hidden sm:inline">Android Code</span>
            </button>
          )}

          {/* Sensor State Badge */}
          {sensorStatus === 'active' && !isSimulationMode ? (
            <div
              id="sensor-status-badge"
              className="text-[10px] text-[#00FF41] font-bold tracking-tight flex items-center gap-1 px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30"
              title="Internal Magnetometer Live"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
              LIVE
            </div>
          ) : (
            <button
              id="sensor-status-badge"
              onClick={onToggleSimulation}
              className="text-[10px] text-[#E0E0E0] hover:text-[#00FF41] flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1D24] border border-[#2A2D35] cursor-pointer transition-colors"
              title="Toggle Emulation Mode"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulationMode ? 'bg-[#FF3E3E]' : 'bg-[#6A6E7A]'}`} />
              {isSimulationMode ? 'SIMULATOR' : 'STANDBY'}
            </button>
          )}

          {sensorStatus === 'unavailable' && !isSimulationMode && (
            <button
              onClick={onConnectSensor}
              className="text-[10px] font-bold px-1.5 py-0.5 bg-[#2A2D35] hover:bg-[#3A3E4A] text-[#FF3E3E] rounded border border-[#FF3E3E]/40 font-mono transition-colors flex items-center gap-1"
              title="Retry Sensor Connection"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


