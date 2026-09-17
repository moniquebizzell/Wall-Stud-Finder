import React, { useState } from 'react';
import { Header } from './components/Header';
import { IndustrialGauge } from './components/IndustrialGauge';
import { DigitalReadout } from './components/DigitalReadout';
import { ControlPanel } from './components/ControlPanel';
import { SimulationSlider } from './components/SimulationSlider';
import { AndroidDeviceShell } from './components/AndroidDeviceShell';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { AndroidPermissionModal } from './components/AndroidPermissionModal';
import { useMagnetometer } from './hooks/useMagnetometer';
import { soundManager } from './utils/audio';
import { Info, Cpu, Code2, Download, BatteryCharging, Power } from 'lucide-react';
import { downloadAndroidStudioProjectZip } from './utils/exportAndroidZip';

export default function App() {
  const [threshold, setThreshold] = useState<number>(70); // 70 µT as requested
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [hasInteractedAudio, setHasInteractedAudio] = useState<boolean>(false);
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [isStudMode, setIsStudMode] = useState<boolean>(false);

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
    toggleSimulation,
    connectSensor,
  } = useMagnetometer({
    threshold,
    audioEnabled,
    hapticsEnabled,
    smoothing: 0.15,
  });

  // Enable audio context on first user touch / click anywhere
  const handleUserInteraction = () => {
    if (!hasInteractedAudio) {
      setHasInteractedAudio(true);
      // Trigger silent test to unblock web audio context
      soundManager.playBeep(900, 0.05);
    }
  };

  const handleGrantPermissions = () => {
    setShowPermissionModal(false);
    connectSensor();
  };

  // Determine dynamic descriptive status text
  const getStatusText = () => {
    if (isPaused) {
      return 'LIFECYCLE: SENSOR UNREGISTERED // BATTERY PRESERVED';
    }
    if (isMetalDetected) {
      return isStudMode ? 'STUD / METAL DETECTED!' : 'METAL DETECTED!';
    }
    if (reading.magnitude >= 40 && reading.magnitude <= 50) {
      return 'NORMAL BACKGROUND (40–50 µT)';
    }
    if (reading.magnitude > 50) {
      return isStudMode ? 'STUD IN PROXIMITY (Elevated Flux)' : 'ELEVATED FLUX (Approaching Object)';
    }
    return 'LOW BACKGROUND FIELD';
  };

  return (
    <div
      id="app-root"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      className="min-h-screen w-full font-mono selection:bg-[#FF3E3E] selection:text-white"
    >
      <AndroidDeviceShell
        isAlert={isMetalDetected && !isPaused}
        threshold={threshold}
        currentFlux={reading.magnitude}
        isFramed={isFramed}
        onToggleFrame={() => setIsFramed(!isFramed)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenPermissions={() => setShowPermissionModal(true)}
      >
        {/* Top Android App Bar / Industrial Header */}
        <Header
          sensorStatus={sensorStatus}
          isSimulationMode={isSimulationMode}
          onToggleSimulation={toggleSimulation}
          onConnectSensor={connectSensor}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          isAlert={isMetalDetected && !isPaused}
        />

        {/* Main Detector Body */}
        <main className="flex-1 w-full px-4 py-3 flex flex-col items-center justify-between gap-3">
          {/* Mode Switcher: Metal Detector vs Magnetic Stud Finder */}
          <div className="w-full max-w-md grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#15171D] border border-[#2A2D35]">
            <button
              id="mode-metal-btn"
              onClick={() => setIsStudMode(false)}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                !isStudMode
                  ? 'bg-[#2A2D35] text-[#FFFFFF] shadow-sm'
                  : 'text-[#6A6E7A] hover:text-[#E0E0E0]'
              }`}
            >
              METAL DETECTOR
            </button>
            <button
              id="mode-stud-btn"
              onClick={() => setIsStudMode(true)}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isStudMode
                  ? 'bg-[#2A2D35] text-[#FFFFFF] shadow-sm'
                  : 'text-[#6A6E7A] hover:text-[#E0E0E0]'
              }`}
            >
              STUD FINDER
            </button>
          </div>

          {/* Dynamic Descriptive Status Banner */}
          {isPaused ? (
            <div
              id="paused-banner"
              className="w-full max-w-md flex items-center justify-between py-2 px-3.5 rounded-xl bg-[#15171D] border border-[#3A3E4A] text-[#6A6E7A] font-mono text-xs"
            >
              <span className="flex items-center gap-1.5 truncate text-[#FFA500]">
                <Power className="w-3.5 h-3.5" />
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
              className="w-full max-w-md flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#15171D] border border-[#FF3E3E] text-[#FF3E3E] font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_30px_rgba(255,62,62,0.25)] animate-pulse"
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#FF3E3E] animate-ping shrink-0" />
                {getStatusText()} (&gt; {threshold} µT)
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF3E3E]/20 text-[#FF3E3E] border border-[#FF3E3E]/40 font-black shrink-0">
                ALERT ON
              </span>
            </div>
          ) : (
            <div
              id="status-banner"
              className="w-full max-w-md flex items-center justify-between py-2 px-3.5 rounded-xl bg-[#15171D] border border-[#2A2D35] text-[#6A6E7A] font-mono text-xs"
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

          {/* Large Industrial Dial Gauge (Centerpiece) */}
          <div className="py-1 flex flex-col items-center justify-center w-full">
            <IndustrialGauge
              value={reading.magnitude}
              threshold={threshold}
              isAlert={isMetalDetected && !isPaused}
              max={200}
              size={310}
              label={isStudMode ? 'STUD FINDER FLUX DENSITY' : 'MAGNETIC FLUX DENSITY'}
              unit="µT"
              isStudMode={isStudMode}
            />
          </div>

          {/* Real-time 3-Axis & Peak Telemetry */}
          <DigitalReadout
            reading={reading}
            peak={peakMagnitude}
            threshold={threshold}
            onResetPeak={resetPeak}
            isAlert={isMetalDetected && !isPaused}
            tareOffset={tareOffset}
          />

          {/* Simulation / Proximity slider for testing */}
          <SimulationSlider
            proximity={simulatedProximity}
            onChangeProximity={setSimulatedProximity}
            isAlert={isMetalDetected && !isPaused}
            threshold={threshold}
          />

          {/* Instrument Controls (Audio, Haptics, Tare, Threshold, Lifecycle) */}
          <ControlPanel
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
            threshold={threshold}
            onChangeThreshold={setThreshold}
            tareOffset={tareOffset}
            onTare={tareCurrent}
            isAlert={isMetalDetected && !isPaused}
          />

          {/* Lifecycle & Battery Saver Bar (Requirement 5) */}
          <div className="w-full max-w-md flex items-center justify-between p-2 rounded-xl bg-[#15171D] border border-[#2A2D35] text-xs">
            <div className="flex items-center gap-2">
              <BatteryCharging className={`w-4 h-4 ${isPaused ? 'text-[#00FF41]' : 'text-[#6A6E7A]'}`} />
              <span className="text-[11px] text-[#E0E0E0] font-mono">
                {isPaused ? 'Lifecycle: Battery Saver (Listener Unregistered)' : 'Lifecycle: Active (Game Delay ~50Hz)'}
              </span>
            </div>
            <button
              id="lifecycle-pause-btn"
              onClick={togglePause}
              className={`py-1 px-2.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer border ${
                isPaused
                  ? 'bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40'
                  : 'bg-[#2A2D35] hover:bg-[#3A3E4A] text-[#E0E0E0] border-[#3A3E4A]'
              }`}
            >
              {isPaused ? 'Resume Sensor' : 'Pause Sensor'}
            </button>
          </div>

          {/* Android Studio Project Export & Native Specs */}
          <div className="w-full max-w-md flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="export-zip-btn"
                onClick={() => downloadAndroidStudioProjectZip()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#3DDC84] hover:bg-[#32b86e] text-black font-mono font-bold text-[11px] transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export APK (.zip)</span>
              </button>

              <button
                id="open-source-modal-btn"
                onClick={() => setIsCodeModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#15171D] hover:bg-[#1E222B] text-[#E0E0E0] border border-[#2A2D35] font-mono font-bold text-[11px] transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#3DDC84]" />
                <span>View Kotlin Code</span>
              </button>
            </div>

            <button
              id="toggle-guide-btn"
              onClick={() => setShowInfo(!showInfo)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-mono text-[#6A6E7A] hover:text-[#E0E0E0] transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showInfo ? 'Hide Android Hardware Details' : 'Android Magnetometer Specifications'}</span>
            </button>

            {showInfo && (
              <div className="p-3.5 rounded-xl bg-[#15171D] border border-[#2A2D35] text-xs text-[#E0E0E0] space-y-2 font-mono">
                <div className="flex items-center gap-1.5 text-[#00FF41] font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>NATIVE ANDROID SENSOR ARCHITECTURE</span>
                </div>
                <p className="text-[#6A6E7A] leading-relaxed">
                  Android smartphones feature a 3-axis Hall effect magnetometer accessed via <code className="text-[#E0E0E0]">Sensor.TYPE_MAGNETIC_FIELD</code> in microteslas (µT).
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[#6A6E7A]">
                  <li>
                    <strong className="text-[#E0E0E0]">Vector Computation:</strong> Combined magnitude is calculated via <code className="text-[#E0E0E0]">sqrt(x² + y² + z²)</code>.
                  </li>
                  <li>
                    <strong className="text-[#E0E0E0]">Earth's Ambient Field:</strong> Typically 40–50 µT.
                  </li>
                  <li>
                    <strong className="text-[#E0E0E0]">Alert Trigger:</strong> Exceeding 70 µT triggers continuous haptic waveforms and a warning tone.
                  </li>
                  <li>
                    <strong className="text-[#E0E0E0]">Lifecycle Battery Management:</strong> Unregisters listener during <code className="text-[#E0E0E0]">onPause()</code> to avoid background battery drain. Completely offline with no login screens.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </main>

        {/* Footer Industrial Stamp matching Recipe 3 style */}
        <footer className="w-full px-4 py-2 text-[10px] font-mono text-[#4A4E5A] border-t border-[#2A2D35] flex justify-between items-center bg-[#0A0B0E]">
          <span>FREQ: 50Hz // SENSOR_DELAY_GAME</span>
          <span>OFFLINE UTILITY • KOTLIN/COMPOSE</span>
        </footer>
      </AndroidDeviceShell>

      {/* Android Studio Source Code Modal */}
      <AndroidCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Android 15 Runtime Sensor Permission Dialog */}
      <AndroidPermissionModal
        isOpen={showPermissionModal}
        onGrant={handleGrantPermissions}
        onDeny={() => setShowPermissionModal(false)}
      />
    </div>
  );
}
