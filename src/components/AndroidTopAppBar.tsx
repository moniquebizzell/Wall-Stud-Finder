import React from 'react';
import { AndroidTab } from './AndroidNavBar';
import { Volume2, VolumeX, RotateCcw, Power, Cpu, Rocket } from 'lucide-react';
import { SensorStatus } from '../types';

interface AndroidTopAppBarProps {
  activeTab: AndroidTab;
  isAlert: boolean;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onTare: () => void;
  tareOffset: number;
  isPaused: boolean;
  onTogglePause: () => void;
  sensorStatus: SensorStatus;
  onOpenPlayModal?: () => void;
}

export const AndroidTopAppBar: React.FC<AndroidTopAppBarProps> = ({
  activeTab,
  isAlert,
  isAudioEnabled,
  onToggleAudio,
  onTare,
  tareOffset,
  isPaused,
  onTogglePause,
  sensorStatus,
  onOpenPlayModal,
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'detector':
        return 'Metal Detector';
      case 'stud_finder':
        return 'Stud Finder';
      case 'scope':
        return 'Flux Oscilloscope';
      case 'settings':
        return 'System & Sensors';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'detector':
        return isAlert ? 'ANOMALY DETECTED (> 70 µT)' : 'Sensor.TYPE_MAGNETIC_FIELD';
      case 'stud_finder':
        return 'Wall Stud & Conduit Scanner';
      case 'scope':
        return 'Real-time 50Hz Waveform';
      case 'settings':
        return 'Android Hardware Config';
    }
  };

  return (
    <div
      id="android-top-app-bar"
      className="w-full bg-[#12141A] border-b border-[#232630] px-4 py-2.5 flex items-center justify-between z-20 shrink-0 select-none shadow-sm"
    >
      {/* Title & Hardware Tag */}
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isPaused
              ? 'bg-[#FFA500]'
              : isAlert
              ? 'bg-[#FF3E3E] animate-ping'
              : 'bg-[#00FF41] animate-pulse'
          }`}
        />
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-white tracking-wide truncate font-sans">
            {getTitle()}
          </h1>
          <p
            className={`text-[10px] font-mono truncate ${
              isAlert ? 'text-[#FF3E3E] font-bold' : 'text-[#8E92A0]'
            }`}
          >
            {getSubtitle()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Play Console Quick Launcher */}
        {onOpenPlayModal && (
          <button
            id="appbar-play-console-btn"
            onClick={onOpenPlayModal}
            title="Google Play Console Deployment Assistant"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#3DDC84]/15 hover:bg-[#3DDC84]/25 text-[#3DDC84] border border-[#3DDC84]/40 transition-all cursor-pointer"
          >
            <Rocket className="w-3 h-3" />
            <span className="hidden sm:inline">PLAY STORE</span>
          </button>
        )}

        {/* Tare / Zero Offset Button */}
        {activeTab !== 'settings' && (
          <button
            id="appbar-tare-btn"
            onClick={onTare}
            title={tareOffset > 0 ? 'Clear Tare' : 'Tare Current Baseline'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
              tareOffset > 0
                ? 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/40'
                : 'bg-[#1C1F28] hover:bg-[#252834] text-[#C0C4D0] border-[#2E3240]'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{tareOffset > 0 ? 'TARED' : 'TARE'}</span>
          </button>
        )}

        {/* Audio Mute/Unmute */}
        <button
          id="appbar-audio-btn"
          onClick={onToggleAudio}
          title={isAudioEnabled ? 'Mute Alert Tone' : 'Enable Alert Tone'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isAudioEnabled
              ? 'bg-[#1C1F28] text-white border-[#2E3240] hover:bg-[#252834]'
              : 'bg-[#1C1F28] text-[#6A6E7A] border-[#2E3240]'
          }`}
        >
          {isAudioEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#3DDC84]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#6A6E7A]" />
          )}
        </button>

        {/* Sensor Lifecycle Quick Pause / Resume Button */}
        <button
          id="appbar-lifecycle-btn"
          onClick={onTogglePause}
          title={isPaused ? 'Resume Sensor (Register)' : 'Pause Sensor (Unregister)'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isPaused
              ? 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/40 animate-pulse'
              : 'bg-[#1C1F28] text-[#3DDC84] border-[#2E3240] hover:bg-[#252834]'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
