import { useState, useEffect, useRef, useCallback } from 'react';
import { MagnetometerReading, SensorStatus } from '../types';
import { soundManager } from '../utils/audio';
import { hapticsManager } from '../utils/haptics';

interface UseMagnetometerOptions {
  threshold: number; // default 70 µT
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  smoothing?: number; // 0 (raw) to 0.9 (heavy smooth)
}

export function useMagnetometer({
  threshold = 70,
  audioEnabled = true,
  hapticsEnabled = true,
  smoothing = 0.2,
}: UseMagnetometerOptions) {
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>('simulated');
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [simulatedProximity, setSimulatedProximity] = useState<number>(0); // 0 to 100%
  const [tareOffset, setTareOffset] = useState<number>(0);
  const [peakMagnitude, setPeakMagnitude] = useState<number>(45);

  // Current reading state
  const [reading, setReading] = useState<MagnetometerReading>({
    x: 18.2,
    y: -24.6,
    z: 36.8,
    magnitude: 47.8,
    timestamp: Date.now(),
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMetalDetected, setIsMetalDetected] = useState<boolean>(false);

  // Requirement 5: Lifecycle Management
  // Automatically pause sensor when window/tab is hidden or app is in background to preserve battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        soundManager.stopAlert();
        hapticsManager.stopContinuous();
        if (sensorRef.current) {
          try {
            (sensorRef.current as { stop: () => void }).stop();
          } catch {
            // ignore
          }
        }
      } else {
        setIsPaused(false);
        if (sensorRef.current && sensorStatus === 'active') {
          try {
            (sensorRef.current as { start: () => void }).start();
          } catch {
            // ignore
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sensorStatus]);

  // Smoothed magnitude reference for needle rendering
  const smoothedMagRef = useRef<number>(45);
  const sensorRef = useRef<unknown>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synchronize audio and haptics preferences
  useEffect(() => {
    soundManager.setMuted(!audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    hapticsManager.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  // Handle alert triggers when isMetalDetected changes
  useEffect(() => {
    if (isMetalDetected) {
      soundManager.startAlert(5);
      hapticsManager.startContinuous();
    } else {
      soundManager.stopAlert();
      hapticsManager.stopContinuous();
    }

    return () => {
      soundManager.stopAlert();
      hapticsManager.stopContinuous();
    };
  }, [isMetalDetected]);

  // Process incoming reading
  const processReading = useCallback((rawX: number, rawY: number, rawZ: number) => {
    const rawMag = Math.sqrt(rawX * rawX + rawY * rawY + rawZ * rawZ);
    
    // Apply optional smoothing
    const currentSmoothed = smoothedMagRef.current;
    const effectiveMag = smoothing > 0 
      ? currentSmoothed + (rawMag - currentSmoothed) * (1 - smoothing)
      : rawMag;
    
    smoothedMagRef.current = effectiveMag;

    const finalMag = Math.max(0, effectiveMag - tareOffset);

    setReading({
      x: Math.round(rawX * 10) / 10,
      y: Math.round(rawY * 10) / 10,
      z: Math.round(rawZ * 10) / 10,
      magnitude: Math.round(finalMag * 10) / 10,
      timestamp: Date.now(),
    });

    setPeakMagnitude((prev) => Math.max(prev, Math.round(finalMag * 10) / 10));

    // Threshold check (70 µT)
    const detected = finalMag >= threshold;
    setIsMetalDetected(detected);
  }, [smoothing, tareOffset, threshold]);

  // Request & connect real magnetometer hardware
  const connectSensor = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Check if Generic Sensor API Magnetometer is in window
    const MagnetometerCtor = (window as unknown as { Magnetometer?: new (opt?: { frequency: number }) => unknown }).Magnetometer;

    if (!MagnetometerCtor) {
      setSensorStatus('unavailable');
      setIsSimulationMode(true);
      return;
    }

    try {
      // If permissions API is available, check permission
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'magnetometer' as PermissionName });
          if (status.state === 'denied') {
            setSensorStatus('permission_denied');
            setIsSimulationMode(true);
            return;
          }
        } catch {
          // Permissions name 'magnetometer' may throw in some browsers; ignore and try direct construction
        }
      }

      // Instantiate hardware magnetometer
      const sensor = new MagnetometerCtor({ frequency: 50 }) as {
        x: number;
        y: number;
        z: number;
        start: () => void;
        stop: () => void;
        addEventListener: (event: string, cb: () => void) => void;
      };

      sensor.addEventListener('reading', () => {
        if (!isSimulationMode) {
          processReading(sensor.x ?? 0, sensor.y ?? 0, sensor.z ?? 0);
        }
      });

      sensor.addEventListener('error', () => {
        setSensorStatus('unavailable');
        setIsSimulationMode(true);
      });

      sensor.start();
      sensorRef.current = sensor;
      setSensorStatus('active');
      setIsSimulationMode(false);
    } catch {
      setSensorStatus('unavailable');
      setIsSimulationMode(true);
    }
  }, [isSimulationMode, processReading]);

  // Simulation loop when hardware sensor is unavailable or simulation mode enabled
  useEffect(() => {
    if (isPaused) return;
    if (!isSimulationMode && sensorStatus === 'active') return;

    let noiseAngle = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (isPaused) return;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      noiseAngle += delta * 2;
      // Normal background magnetism is around 40-50 µT
      // Natural subtle environmental wobble
      const ambientBase = 46.5;
      const ambientNoise = Math.sin(noiseAngle * 3.1) * 1.8 + Math.cos(noiseAngle * 1.7) * 1.2;
      
      // Proximity effect: simulated metal object approaching phone sensor
      // 0% proximity => ambient ~46 µT
      // 50% proximity => ~72 µT (crosses 70 µT threshold)
      // 100% proximity => ~155 µT (intense metal detection)
      const metalProximityFactor = Math.pow(simulatedProximity / 100, 1.8) * 120;
      const totalSimulatedMag = ambientBase + ambientNoise + metalProximityFactor;

      // Decompose into plausible 3-axis vectors
      const x = (totalSimulatedMag * 0.35) + Math.sin(noiseAngle * 2.3) * 0.8;
      const y = -(totalSimulatedMag * 0.5) + Math.cos(noiseAngle * 1.9) * 0.8;
      const z = Math.sqrt(Math.max(0, totalSimulatedMag * totalSimulatedMag - x * x - y * y));

      processReading(x, y, z);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPaused, isSimulationMode, sensorStatus, simulatedProximity, processReading]);

  // Mount effect to initialize sensor
  useEffect(() => {
    connectSensor();

    return () => {
      if (sensorRef.current) {
        try {
          (sensorRef.current as { stop: () => void }).stop();
        } catch {
          // ignore
        }
      }
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [connectSensor]);

  const resetPeak = useCallback(() => {
    setPeakMagnitude(reading.magnitude);
  }, [reading.magnitude]);

  const toggleSimulation = useCallback(() => {
    setIsSimulationMode((prev) => {
      const next = !prev;
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        soundManager.stopAlert();
        hapticsManager.stopContinuous();
        setIsMetalDetected(false);
        if (sensorRef.current) {
          try {
            (sensorRef.current as { stop: () => void }).stop();
          } catch {
            // ignore
          }
        }
      } else {
        if (sensorRef.current && sensorStatus === 'active') {
          try {
            (sensorRef.current as { start: () => void }).start();
          } catch {
            // ignore
          }
        }
      }
      return next;
    });
  }, [sensorStatus]);

  const tareCurrent = useCallback(() => {
    // Zero out current ambient reading
    setTareOffset((prev) => (prev > 0 ? 0 : smoothedMagRef.current));
  }, []);

  return {
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
  };
}
