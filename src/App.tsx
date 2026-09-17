import React, { useState } from 'react';
import { AndroidTopAppBar } from './components/AndroidTopAppBar';
import { AndroidNavBar, AndroidTab } from './components/AndroidNavBar';
import { IndustrialGauge } from './components/IndustrialGauge';
import { DigitalReadout } from './components/DigitalReadout';
import { SimulationSlider } from './components/SimulationSlider';
import { StudFinderView } from './components/StudFinderView';
import { FluxScopeView } from './components/FluxScopeView';
import { SettingsView } from './components/SettingsView';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { AndroidPermissionModal } from './components/AndroidPermissionModal';
import { useMagnetometer } from './hooks/useMagnetometer';
import { soundManager } from './utils/audio';
import {
  Wifi,
  Battery,
  Signal,
  Bell,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AndroidTab>('detector');
  const [threshold, setThreshold] = useState<number>(70); // 70 µT requested default
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [hasInteractedAudio, setHasInteractedAudio] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Android Clock
  React.useEffect(() => {
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

  const {
    reading,
    sensorStatus,
    isSimulationMode,
    isPaused,
    togglePause,
    simulatedProximity,
    setSimulatedProximity,
    isMetalDetected,
    peakMagnitude,
    resetPeak,
    tareOffset,
    tareCurrent,
    connectSensor,
  } = useMagnetometer({
    threshold,
    audioEnabled,
    hapticsEnabled,
    smoothing: 0.15,
  });

  // Enable audio context on first user interaction
  const handleUserInteraction = () => {
    if (!hasInteractedAudio) {
      setHasInteractedAudio(true);
      soundManager.playBeep(900, 0.05);
    }
  };

  const handleGrantPermissions = () => {
    setShowPermissionModal(false);
    connectSensor();
  };

  // Dynamic descriptive status indicator per user requirement 2
  const getStatusText = () => {
    if (isPaused) {
      return 'LIFECYCLE: SENSOR UNREGISTERED // BATTERY PRESERVED';
    }
    if (isMetalDetected) {
      return activeTab === 'stud_finder' ? 'STUD / METAL DETECTED!' : 'METAL DETECTED!';
    }
    if (reading.magnitude >= 40 && reading.magnitude <= 50) {
      return 'NORMAL BACKGROUND (40–50 µT)';
    }
    if (reading.magnitude > 50) {
      return activeTab === 'stud_finder' ? 'STUD IN PROXIMITY' : 'ELEVATED FLUX';
    }
    return 'LOW BACKGROUND FIELD';
  };

  return (
    <div
      id="android-native-app-container"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      className="min-h-screen w-full bg-[#050608] text-[#E0E0E0] flex items-center justify-center font-sans select-none overflow-x-hidden p-0 sm:p-3"
    >
      {/* Android Device Window / Surface */}
      <div
        id="android-phone-surface"
        className={`relative w-full max-w-[440px] h-[min(920px,100vh)] sm:h-[min(900px,96vh)] sm:rounded-[40px] bg-[#0A0B0E] border-0 sm:border-[8px] sm:border-[#1C1F26] sm:shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_0_2px_#2E323D] flex flex-col overflow-hidden transition-all duration-300 ${
          isMetalDetected && !isPaused ? 'sm:border-[#FF3E3E]' : ''
        }`}
      >
        {/* 1. Android Native Status Bar */}
        <div className="w-full h-10 px-5 flex items-center justify-between text-xs font-medium text-[#E0E0E0] bg-[#12141A] z-30 shrink-0 select-none border-b border-[#1C1F28]">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-xs">{currentTime}</span>
            {isMetalDetected && !isPaused && (
              <Bell className="w-3 h-3 text-[#FF3E3E] animate-pulse ml-1" />
            )}
          </div>

          {/* Android Punch-Hole Front Camera */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#000000] border border-[#252830] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#0F141F]" />
          </div>

          {/* Network & Battery Status */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-[#E0E0E0]" />
            <Wifi className="w-3.5 h-3.5 text-[#E0E0E0]" />
            <div className="flex items-center gap-1 font-mono">
              <span className="text-[10px] text-[#A0A4B0]">98%</span>
              <Battery className="w-3.5 h-3.5 text-[#00FF41]" />
            </div>
          </div>
        </div>

        {/* 2. Android Material 3 Top App Bar */}
        <AndroidTopAppBar
          activeTab={activeTab}
          isAlert={isMetalDetected && !isPaused}
          isAudioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onTare={tareCurrent}
          tareOffset={tareOffset}
          isPaused={isPaused}
          onTogglePause={togglePause}
          sensorStatus={sensorStatus}
        />

        {/* 3. Main Screen Viewport (Scrollable Content based on activeTab) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-[#0A0B0E]">
          {activeTab === 'detector' && (
            <div className="flex-1 w-full px-4 py-2.5 flex flex-col items-center justify-between gap-3 font-mono">
              {/* Dynamic Status Indicator Banner */}
              {isPaused ? (
                <div
                  id="paused-banner"
                  className="w-full max-w-md flex items-center justify-between py-2 px-3 rounded-xl bg-[#15171D] border border-[#3A3E4A] text-[#6A6E7A] text-xs font-mono"
                >
                  <span className="flex items-center gap-1.5 truncate text-[#FFA500]">
                    {getStatusText()}
                  </span>
                  <button
                    onClick={togglePause}
                    className="text-[9px] px-2 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 font-bold shrink-0 cursor-pointer"
                  >
                    RESUME
                  </button>
                </div>
              ) : isMetalDetected ? (
                <div
                  id="alarm-banner"
                  className="w-full max-w-md flex items-center justify-between py-2 px-3 rounded-xl bg-[#15171D] border border-[#FF3E3E] text-[#FF3E3E] text-xs font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(255,62,62,0.3)] animate-pulse"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#FF3E3E] animate-ping shrink-0" />
                    {getStatusText()} (&gt; {threshold} µT)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF3E3E]/20 text-[#FF3E3E] border border-[#FF3E3E]/40 font-black shrink-0">
                    ALERT ON
                  </span>
                </div>
              ) : (
                <div
                  id="status-banner"
                  className="w-full max-w-md flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#15171D] border border-[#2A2D35] text-[#8E92A0] text-xs font-mono"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        reading.magnitude >= 40 && reading.magnitude <= 50 ? 'bg-[#00FF41]' : 'bg-[#FFA500]'
                      } animate-pulse`}
                    />
                    STATUS: {getStatusText()}
                  </span>
                  <span className="text-[10px] text-[#6A6E7A]">LIMIT: {threshold} µT</span>
                </div>
              )}

              {/* Core Requirement 1: Centerpiece Industrial Circular Dial Gauge */}
              <div className="py-0.5 flex flex-col items-center justify-center w-full">
                <IndustrialGauge
                  value={reading.magnitude}
                  threshold={threshold}
                  isAlert={isMetalDetected && !isPaused}
                  max={200}
                  size={290}
                  label="MAGNETIC FLUX DENSITY"
                  unit="µT"
                  isStudMode={false}
                />
              </div>

              {/* Exact Numeric Value & 3-Axis Readouts */}
              <DigitalReadout
                reading={reading}
                peak={peakMagnitude}
                threshold={threshold}
                onResetPeak={resetPeak}
                isAlert={isMetalDetected && !isPaused}
                tareOffset={tareOffset}
              />

              {/* Interactive Simulation / Metal Proximity Slider for easy testing */}
              <SimulationSlider
                proximity={simulatedProximity}
                onChangeProximity={setSimulatedProximity}
                isAlert={isMetalDetected && !isPaused}
                threshold={threshold}
              />

              {/* Quick Tare & Reset Floating Control Row */}
              <div className="w-full max-w-md flex items-center justify-between gap-2 pt-1">
                <button
                  id="detector-tare-btn"
                  onClick={tareCurrent}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 border shadow-sm ${
                    tareOffset > 0
                      ? 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/40'
                      : 'bg-[#15171D] hover:bg-[#1C2028] text-white border-[#2A2D35]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#3DDC84]" />
                  <span>{tareOffset > 0 ? `ZERO OFFSET (${tareOffset.toFixed(1)} µT)` : 'ZERO CALIBRATION (TARE)'}</span>
                </button>

                <button
                  id="detector-reset-peak-btn"
                  onClick={resetPeak}
                  className="py-2 px-3 rounded-xl bg-[#15171D] hover:bg-[#1C2028] text-[#8E92A0] hover:text-white border border-[#2A2D35] text-xs font-mono transition-colors cursor-pointer"
                >
                  Reset Peak
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stud_finder' && (
            <StudFinderView
              reading={reading}
              threshold={threshold}
              isAlert={isMetalDetected && !isPaused}
              onTare={tareCurrent}
              tareOffset={tareOffset}
            />
          )}

          {activeTab === 'scope' && (
            <FluxScopeView
              reading={reading}
              threshold={threshold}
              peak={peakMagnitude}
              isAlert={isMetalDetected && !isPaused}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              threshold={threshold}
              onChangeThreshold={setThreshold}
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled(!audioEnabled)}
              hapticsEnabled={hapticsEnabled}
              onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
            />
          )}
        </div>

        {/* 4. Android Material 3 Bottom Navigation Bar */}
        <AndroidNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isAlert={isMetalDetected && !isPaused}
        />

        {/* 5. Android System Gesture Bar (Pill) */}
        <div className="w-full h-5 bg-[#12141A] flex items-center justify-center shrink-0 z-30 select-none">
          <div className="w-28 h-1 rounded-full bg-[#4A4E5A]/70" />
        </div>
      </div>

      {/* Android Studio Source Code Modal (accessible from Settings) */}
      <AndroidCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Sensor Permission Dialog */}
      <AndroidPermissionModal
        isOpen={showPermissionModal}
        onGrant={handleGrantPermissions}
        onDeny={() => setShowPermissionModal(false)}
      />
    </div>
  );
}
