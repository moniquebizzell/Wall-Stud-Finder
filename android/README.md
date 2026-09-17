# MAG-TECH 4000: Industrial Android Metal Detector

A native Android application utilizing the smartphone's internal 3-axis Magnetometer (`Sensor.TYPE_MAGNETIC_FIELD`) to measure geomagnetic flux density in microteslas (µT) and signal ferrous metal proximity.

## Key Features
- **Hardware Magnetometer Integration**: High-frequency sampling via `SensorManager.SENSOR_DELAY_GAME` (~50 Hz).
- **Industrial Dial Gauge**: Custom Jetpack Compose Canvas & Android Custom View with metallic bezel, normal ambient zone (40–50 µT), and danger zone (> 70 µT).
- **Haptic Alerts**: Continuous vibrating waveform via Android `Vibrator` / `VibrationEffect.createWaveform()`.
- **Auditory Alert**: Low-latency tone beeps via `ToneGenerator(AudioManager.STREAM_ALARM)`.
- **Vector Analysis**: Live tracking of X (Bx), Y (By), and Z (Bz) components.
- **Ground Balance / Tare**: Zero-out ambient baseline to detect minute relative deviations.

## Building with Android Studio
1. Open **Android Studio** (Hedgehog, Iguana, Jellyfish, or newer).
2. Select **File > Open** and choose the `android/` directory.
3. Allow Gradle to sync dependencies (`compose-bom`, `material3`, `core-ktx`).
4. Connect an Android smartphone with an internal magnetometer (compass).
5. Click **Run (Shift + F10)** to install the APK directly on your phone.
