package com.industrial.metaldetector

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.industrial.metaldetector.ui.ComposeMetalDetectorScreen
import com.industrial.metaldetector.ui.theme.MetalDetectorTheme
import kotlin.math.sqrt

/**
 * Metal Detector & Magnetic Stud Finder
 * Native Android app utilizing Sensor.TYPE_MAGNETIC_FIELD.
 *
 * Core Requirements:
 * 1. UI Design: Circular dial gauge rendering combined flux sqrt(x^2 + y^2 + z^2) in µT.
 * 2. Readout: Exact numeric value alongside dynamic descriptive status indicators ("Normal Background" vs "Metal Detected!").
 * 3. Detection Threshold: Ambient 40-50 µT, Alert threshold 70 µT.
 * 4. Alerts: Gauge and accents turn red, haptic vibration feedback, audible detection tone.
 * 5. Lifecycle Management: Properly unregisters sensor listener in onPause() to preserve battery life.
 *    Kept entirely offline with no login screens.
 */
class MainActivity : ComponentActivity(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private var magnetometer: Sensor? = null

    // Vibration & Sound alert hardware managers
    private var vibrator: Vibrator? = null
    private var vibratorManager: VibratorManager? = null
    private var toneGenerator: ToneGenerator? = null
    private var isAlerting = false

    // Reactive State
    private var currentFlux by mutableFloatStateOf(45.0f)
    private var rawX by mutableFloatStateOf(0.0f)
    private var rawY by mutableFloatStateOf(0.0f)
    private var rawZ by mutableFloatStateOf(0.0f)
    private var peakFlux by mutableFloatStateOf(45.0f)
    private var tareOffset by mutableFloatStateOf(0.0f)
    private var alertThreshold by mutableFloatStateOf(70.0f)
    private var isAudioEnabled by mutableStateOf(true)
    private var isHapticsEnabled by mutableStateOf(true)
    private var isSensorActive by mutableStateOf(false)
    private var isStudFinderMode by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Hardware Sensor Manager
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

        // 2. Hardware Vibrator Setup
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibrator = vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        // 3. Low-Latency Audio Tone Generator
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 85)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        setContent {
            MetalDetectorTheme {
                ComposeMetalDetectorScreen(
                    currentFlux = currentFlux,
                    rawX = rawX,
                    rawY = rawY,
                    rawZ = rawZ,
                    peakFlux = peakFlux,
                    threshold = alertThreshold,
                    tareOffset = tareOffset,
                    isAudioEnabled = isAudioEnabled,
                    isHapticsEnabled = isHapticsEnabled,
                    isSensorActive = isSensorActive,
                    isStudFinderMode = isStudFinderMode,
                    onToggleMode = { isStudFinderMode = !isStudFinderMode },
                    onToggleAudio = { isAudioEnabled = !isAudioEnabled },
                    onToggleHaptics = { isHapticsEnabled = !isHapticsEnabled },
                    onTare = {
                        tareOffset = if (tareOffset > 0f) 0f else currentFlux
                    },
                    onResetPeak = { peakFlux = currentFlux },
                    onChangeThreshold = { alertThreshold = it }
                )
            }
        }
    }

    /**
     * Requirement 5: Lifecycle Management
     * Register the sensor listener when in foreground.
     */
    override fun onResume() {
        super.onResume()
        magnetometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            isSensorActive = true
        } ?: run {
            isSensorActive = false
        }
    }

    /**
     * Requirement 5: Lifecycle Management
     * Properly unregister sensor listener when app is paused or in background
     * to prevent background battery drain.
     */
    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
        isSensorActive = false
        stopAlert()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopAlert()
        toneGenerator?.release()
        toneGenerator = null
    }

    /**
     * SensorEventListener implementation:
     * Computes combined flux density = sqrt(x^2 + y^2 + z^2) in microteslas (µT).
     */
    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_MAGNETIC_FIELD) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]

            rawX = x
            rawY = y
            rawZ = z

            // Combined magnetic flux density: |B| = sqrt(x² + y² + z²)
            val combinedMagnitude = sqrt((x * x + y * y + z * z).toDouble()).toFloat()
            val effective = (combinedMagnitude - tareOffset).coerceAtLeast(0f)
            currentFlux = effective

            if (effective > peakFlux) {
                peakFlux = effective
            }

            // Detection Threshold (70 µT) & Alerts
            if (effective >= alertThreshold) {
                startAlert()
            } else {
                stopAlert()
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Calibration tracking
    }

    private fun startAlert() {
        if (isAlerting) return
        isAlerting = true

        // 4. Alerts: Haptic vibration feedback
        if (isHapticsEnabled && vibrator?.hasVibrator() == true) {
            val timings = longArrayOf(0, 100, 50, 100)
            val amplitudes = intArrayOf(0, 255, 0, 255)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createWaveform(timings, amplitudes, 0)
                vibrator?.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(timings, 0)
            }
        }

        // 4. Alerts: Audible detection tone
        if (isAudioEnabled) {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP, 300)
        }
    }

    private fun stopAlert() {
        if (!isAlerting) return
        isAlerting = false
        vibrator?.cancel()
        toneGenerator?.stopTone()
    }
}
