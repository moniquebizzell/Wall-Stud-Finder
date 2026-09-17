import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Maximize2,
  Code2,
  Bell,
  Sliders,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface AndroidDeviceShellProps {
  children: React.ReactNode;
  isAlert: boolean;
  threshold: number;
  currentFlux: number;
  isFramed: boolean;
  onToggleFrame: () => void;
  onOpenCodeModal: () => void;
  onOpenPermissions: () => void;
}

export const AndroidDeviceShell: React.FC<AndroidDeviceShellProps> = ({
  children,
  isAlert,
  threshold,
  currentFlux,
  isFramed,
  onToggleFrame,
  onOpenCodeModal,
  onOpenPermissions,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [showHeadsUp, setShowHeadsUp] = useState<boolean>(false);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Android heads-up notification when metal is detected
  useEffect(() => {
    if (isAlert) {
      setShowHeadsUp(true);
    } else {
      const timer = setTimeout(() => setShowHeadsUp(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isAlert]);

  return (
    <div className="min-h-screen w-full bg-[#07080B] text-[#E0E0E0] flex flex-col items-center justify-center p-0 md:p-4 font-sans select-none overflow-x-hidden">
      {/* Top Desktop Utility Switcher (only visible on wider screens) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-2xl mb-3 px-4 text-xs font-mono text-[#6A6E7A]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
          <span>ANDROID RUNTIME (API 35 • KOTLIN / COMPOSE)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFrame}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-[#15171D] hover:bg-[#20232B] text-[#E0E0E0] border border-[#2A2D35] transition-colors cursor-pointer"
          >
            {isFramed ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{isFramed ? 'Expanded View' : 'Phone Frame'}</span>
          </button>

          <button
            id="view-android-code-btn"
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-[#3DDC84]/15 hover:bg-[#3DDC84]/25 text-[#3DDC84] border border-[#3DDC84]/40 font-bold transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Android Studio Code</span>
          </button>
        </div>
      </div>

      {/* Android Device Body */}
      <div
        id="android-phone-frame"
        className={`relative transition-all duration-300 w-full flex flex-col ${
          isFramed
            ? 'max-w-[440px] h-[min(920px,94vh)] rounded-[44px] bg-[#0A0B0E] border-[8px] border-[#1C1F26] shadow-[0_0_80px_rgba(0,0,0,0.85),0_0_0_2px_#2E323D] overflow-hidden my-auto'
            : 'max-w-xl min-h-screen bg-[#0A0B0E] border-x border-[#1C1F26]'
        }`}
      >
        {/* Android Status Bar */}
        <div className="w-full h-11 px-6 flex items-center justify-between text-xs font-medium text-[#E0E0E0] bg-[#0A0B0E]/95 z-30 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight">{currentTime}</span>
            {isAlert && (
              <Bell className="w-3 h-3 text-[#FF3E3E] animate-pulse" />
            )}
          </div>

          {/* Android Punch-Hole Front Camera */}
          {isFramed && (
            <div className="w-4 h-4 rounded-full bg-[#000000] border border-[#252830] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0F141F]" />
            </div>
          )}

          {/* System status icons (5G, Wi-Fi, Battery) */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-[#E0E0E0]" />
            <Wifi className="w-3.5 h-3.5 text-[#E0E0E0]" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#A0A4B0]">98%</span>
              <Battery className="w-4 h-4 text-[#00FF41]" />
            </div>
          </div>
        </div>

        {/* Android Heads-Up Notification Alert */}
        {showHeadsUp && (
          <div className="absolute top-12 left-3 right-3 z-40 animate-in slide-in-from-top duration-200">
            <div className="p-3 rounded-2xl bg-[#1A1113] border border-[#FF3E3E] shadow-2xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FF3E3E] text-black flex items-center justify-center font-bold shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[#FF3E3E] flex items-center gap-1.5">
                    <span>METAL DETECTED</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF3E3E]/20 text-[#FF3E3E]">
                      &gt; {threshold} µT
                    </span>
                  </div>
                  <div className="text-[10px] text-[#A0A4B0]">
                    Flux anomaly spike: {currentFlux.toFixed(1)} µT
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FF3E3E]" />
            </div>
          </div>
        )}

        {/* App Main Scrollable Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
          {children}
        </div>

        {/* Android Bottom Navigation Bar */}
        <div className="w-full h-8 bg-[#0A0B0E] flex items-center justify-center shrink-0 z-30">
          <div className="w-32 h-1 rounded-full bg-[#4A4E5A]/80 hover:bg-[#E0E0E0] transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
