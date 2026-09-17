export interface MagnetometerReading {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

export type SensorStatus = 'active' | 'unavailable' | 'permission_denied' | 'simulated';

export interface DetectorSettings {
  threshold: number; // default 70 µT
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  volume: number; // 0 to 1
  smoothingFactor: number; // 0 to 1
}
