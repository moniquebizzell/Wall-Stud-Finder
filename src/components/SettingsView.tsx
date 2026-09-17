import React from 'react';
import {
  Sliders,
  Volume2,
  Vibrate,
  BatteryCharging,
  Cpu,
  Code2,
  Download,
  Info,
  ShieldCheck,
  Power
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { hapticsManager } from '../utils/haptics';
import { downloadAndroidStudioProjectZip } from '../utils/exportAndroidZip';

interface SettingsViewProps {
  threshold: number;
  onChangeThreshold: (val: number) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenCodeModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  threshold,
  onChangeThreshold,
  audioEnabled,
  onToggleAudio,
  hapticsEnabled,
  onToggleHaptics,
  isPaused,
  onTogglePause,
  onOpenCodeModal,
}) => {
  const handleTestAlert = () => {
    soundManager.playBeep(980, 0.35);
    hapticsManager.triggerSingle(60);
  };

  return (
    <div className="flex-1 w-full p-4 flex flex-col items-center gap-4 font-mono overflow-y-auto">
      {/* 1. Detection Threshold Setting */}
      <div className="w-full max-w-md p-3.5 rounded-xl bg-[#15171D] border border-[#232630] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#3DDC84]" />
            <span className="text-xs font-bold text-white uppercase">Detection Threshold</span>
          </div>
          <span className="text-xs font-bold text-[#FF3E3E] bg-[#FF3E3E]/15 border border-[#FF3E3E]/40 px-2 py-0.5 rounded">
            {threshold} µT
          </span>
        </div>

        <p className="text-[11px] text-[#8E92A0] leading-relaxed">
          Ambient Earth background is typically <strong className="text-[#00FF41]">40–50 µT</strong>. The detection alert fires whenever magnetic flux reaches or surpasses this threshold.
        </p>

        <div className="space-y-1.5">
          <input
            id="threshold-slider"
            type="range"
            min={50}
            max={120}
            step={1}
            value={threshold}
            onChange={(e) => onChangeThreshold(Number(e.target.value))}
            className="w-full accent-[#FF3E3E] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#6A6E7A]">
            <span>50 µT (Sensitive)</span>
            <span className="text-[#E0E0E0] font-bold">70 µT (Default)</span>
            <span>120 µT (Coarse)</span>
          </div>
        </div>
      </div>

      {/* 2. Alert Feedback Preferences */}
      <div className="w-full max-w-md p-3.5 rounded-xl bg-[#15171D] border border-[#232630] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase">Feedback & Alerts</span>
          <button
            onClick={handleTestAlert}
            className="text-[10px] text-[#3DDC84] bg-[#3DDC84]/15 border border-[#3DDC84]/40 px-2 py-0.5 rounded hover:bg-[#3DDC84]/25 transition-colors cursor-pointer"
          >
            Test Feedback
          </button>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <Volume2 className={`w-4 h-4 ${audioEnabled ? 'text-[#3DDC84]' : 'text-[#6A6E7A]'}`} />
            <div>
              <div className="text-xs font-bold text-white">ToneGenerator Audio Alert</div>
              <div className="text-[10px] text-[#6A6E7A]">Low-latency sound when &gt; {threshold} µT</div>
            </div>
          </div>
          <button
            id="settings-audio-switch"
            onClick={onToggleAudio}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              audioEnabled ? 'bg-[#3DDC84]' : 'bg-[#252834]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                audioEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="h-[1px] bg-[#232630]" />

        {/* Haptics Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <Vibrate className={`w-4 h-4 ${hapticsEnabled ? 'text-[#3DDC84]' : 'text-[#6A6E7A]'}`} />
            <div>
              <div className="text-xs font-bold text-white">VibratorManager Haptics</div>
              <div className="text-[10px] text-[#6A6E7A]">Continuous waveform vibration pattern</div>
            </div>
          </div>
          <button
            id="settings-haptics-switch"
            onClick={onToggleHaptics}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              hapticsEnabled ? 'bg-[#3DDC84]' : 'bg-[#252834]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Lifecycle & Battery Preservation (Core Requirement 5) */}
      <div className="w-full max-w-md p-3.5 rounded-xl bg-[#15171D] border border-[#232630] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-[#3DDC84]" />
            <span className="text-xs font-bold text-white uppercase">Lifecycle Management</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              isPaused
                ? 'bg-[#FFA500]/15 text-[#FFA500] border-[#FFA500]/40'
                : 'bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40'
            }`}
          >
            {isPaused ? 'SENSOR UNREGISTERED' : 'SENSOR ACTIVE'}
          </span>
        </div>

        <p className="text-[11px] text-[#8E92A0] leading-relaxed">
          On native Android, <code className="text-white">SensorEventListener</code> is automatically unregistered during <code className="text-white">onPause()</code> to protect device battery life.
        </p>

        <button
          id="settings-lifecycle-toggle"
          onClick={onTogglePause}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            isPaused
              ? 'bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40'
              : 'bg-[#1C1F28] hover:bg-[#252834] text-white border-[#2E3342]'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isPaused ? 'Resume Sensor (registerListener)' : 'Pause Sensor (unregisterListener)'}</span>
        </button>
      </div>

      {/* 4. Native Kotlin Code & Export Project Buttons */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2">
        <button
          id="settings-export-zip-btn"
          onClick={() => downloadAndroidStudioProjectZip()}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#3DDC84] hover:bg-[#32b86e] text-black font-bold text-xs transition-colors cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export APK (.zip)</span>
        </button>

        <button
          id="settings-view-code-btn"
          onClick={onOpenCodeModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1C1F28] hover:bg-[#252834] text-white border border-[#2E3342] font-bold text-xs transition-colors cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-[#A97BFF]" />
          <span>Kotlin / Compose Code</span>
        </button>
      </div>

      {/* 5. Android Sensor Specifications & Offline Guarantee */}
      <div className="w-full max-w-md p-3 rounded-xl bg-[#12141A] border border-[#232630] text-[10px] text-[#8E92A0] space-y-1.5">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3DDC84]" />
          <span>100% OFFLINE UTILITY • ZERO LOGIN SCREENS</span>
        </div>
        <p>• Sensor: <span className="text-white">Sensor.TYPE_MAGNETIC_FIELD</span></p>
        <p>• Vector Math: <span className="text-white">sqrt(x² + y² + z²) in µT</span></p>
        <p>• Delay Mode: <span className="text-white">SENSOR_DELAY_GAME (~50Hz)</span></p>
        <p>• Android Target: <span className="text-white">API 35 (Android 15) • Compose 1.6</span></p>
      </div>
    </div>
  );
};
