import React, { useState, useEffect, useRef } from 'react';
import { MagnetometerReading } from '../types';
import { Activity, Zap, Cpu, ArrowDownUp } from 'lucide-react';

interface FluxScopeViewProps {
  reading: MagnetometerReading;
  threshold: number;
  peak: number;
  isAlert: boolean;
}

export const FluxScopeView: React.FC<FluxScopeViewProps> = ({
  reading,
  threshold,
  peak,
  isAlert,
}) => {
  // Keep last 40 history points
  const [history, setHistory] = useState<number[]>(() => Array(40).fill(46));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setHistory((prev) => {
      const next = [...prev.slice(1), reading.magnitude];
      return next;
    });
  }, [reading.magnitude]);

  // Draw oscilloscope waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0F1117';
    ctx.fillRect(0, 0, width, height);

    // Draw Oscilloscope Grid Lines
    ctx.strokeStyle = '#1C202B';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const maxFlux = 160;
    const getY = (val: number) => height - (val / maxFlux) * height;

    // 1. Draw Ambient Background Field Zone (40–50 µT)
    const yAmbientHigh = getY(50);
    const yAmbientLow = getY(40);
    ctx.fillStyle = 'rgba(0, 255, 65, 0.08)';
    ctx.fillRect(0, yAmbientHigh, width, yAmbientLow - yAmbientHigh);
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, yAmbientLow);
    ctx.lineTo(width, yAmbientLow);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, yAmbientHigh);
    ctx.lineTo(width, yAmbientHigh);
    ctx.stroke();

    // 2. Draw 70 µT Alert Threshold Line
    const yThreshold = getY(threshold);
    ctx.strokeStyle = '#FF3E3E';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(0, yThreshold);
    ctx.lineTo(width, yThreshold);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 3. Draw Flux Waveform Trace
    if (history.length > 1) {
      ctx.beginPath();
      const step = width / (history.length - 1);
      history.forEach((val, i) => {
        const x = i * step;
        const y = Math.max(4, Math.min(height - 4, getY(val)));
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.strokeStyle = isAlert ? '#FF3E3E' : '#3DDC84';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isAlert ? 'rgba(255, 62, 62, 0.6)' : 'rgba(61, 220, 132, 0.6)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
  }, [history, threshold, isAlert]);

  return (
    <div className="flex-1 w-full p-4 flex flex-col items-center justify-between gap-3 font-mono">
      {/* Top Scope Telemetry Stats */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-[#15171D] border border-[#232630] flex flex-col">
          <span className="text-[9px] text-[#8E92A0]">CURRENT FLUX</span>
          <span className={`text-lg font-bold ${isAlert ? 'text-[#FF3E3E]' : 'text-white'}`}>
            {reading.magnitude.toFixed(1)} <span className="text-[10px] text-[#3DDC84]">µT</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#15171D] border border-[#232630] flex flex-col">
          <span className="text-[9px] text-[#8E92A0]">PEAK FLUX</span>
          <span className="text-lg font-bold text-white">
            {peak.toFixed(1)} <span className="text-[10px] text-[#8E92A0]">µT</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#15171D] border border-[#232630] flex flex-col">
          <span className="text-[9px] text-[#8E92A0]">ALERT TRIGGER</span>
          <span className="text-lg font-bold text-[#FF3E3E]">
            {threshold} <span className="text-[10px] text-[#FF3E3E]/80">µT</span>
          </span>
        </div>
      </div>

      {/* Scope Canvas */}
      <div className="w-full max-w-md flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] text-[#8E92A0] px-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#3DDC84]" />
            <span>MAGNETIC FLUX OSCILLOSCOPE (50Hz)</span>
          </div>
          <span className="text-[9px] text-[#00FF41]">● SENSOR_DELAY_GAME</span>
        </div>

        <div className="relative w-full h-52 rounded-xl bg-[#0F1117] border border-[#232630] overflow-hidden shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={380}
            height={208}
            className="w-full h-full block"
          />

          {/* Scope Labels */}
          <div className="absolute top-2 right-2 text-[9px] font-mono text-[#FF3E3E] bg-[#FF3E3E]/10 px-1.5 py-0.5 rounded border border-[#FF3E3E]/30">
            THRESHOLD: {threshold} µT
          </div>
          <div className="absolute bottom-8 left-2 text-[9px] font-mono text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.5 rounded border border-[#00FF41]/30">
            AMBIENT FIELD: 40–50 µT
          </div>
        </div>
      </div>

      {/* 3-Axis Instantaneous Vector Components */}
      <div className="w-full max-w-md p-3 rounded-xl bg-[#15171D] border border-[#232630] space-y-2">
        <div className="text-[10px] text-[#8E92A0] uppercase font-bold flex items-center justify-between">
          <span>Orthogonal Vector Channels</span>
          <span className="text-[#3DDC84]">Sensor.TYPE_MAGNETIC_FIELD</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#FF5555] font-bold">X-Axis (Pitch):</span>
            <span className="text-white">{reading.x > 0 ? `+${reading.x.toFixed(1)}` : reading.x.toFixed(1)} µT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#55FF55] font-bold">Y-Axis (Roll):</span>
            <span className="text-white">{reading.y > 0 ? `+${reading.y.toFixed(1)}` : reading.y.toFixed(1)} µT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5599FF] font-bold">Z-Axis (Azimuth):</span>
            <span className="text-white">{reading.z > 0 ? `+${reading.z.toFixed(1)}` : reading.z.toFixed(1)} µT</span>
          </div>
        </div>
      </div>

      {/* Android Hardware Spec Placard */}
      <div className="w-full max-w-md p-2.5 rounded-xl bg-[#12141A] border border-[#232630] flex items-center justify-between text-[10px] text-[#6A6E7A]">
        <div className="flex items-center gap-1.5 text-[#E0E0E0]">
          <Cpu className="w-3.5 h-3.5 text-[#3DDC84]" />
          <span>ACCURACY: HIGH (CALIBRATED)</span>
        </div>
        <span>SAMPLING: 50.0 SPS</span>
      </div>
    </div>
  );
};
