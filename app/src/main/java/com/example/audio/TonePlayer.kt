package com.example.audio

import android.media.AudioManager
import android.media.ToneGenerator
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Manages audible detection tones when magnetic field surpasses threshold.
 * Uses Android ToneGenerator with pulse cadence frequency modulation.
 */
class TonePlayer {
    private var toneGenerator: ToneGenerator? = null
    private var pulsingJob: Job? = null

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 85)
        } catch (e: Exception) {
            Log.w("TonePlayer", "Could not initialize ToneGenerator", e)
        }
    }

    /**
     * Start playing pulsed alert tones modulated by signal intensity.
     * @param intensity 0.0 (at threshold 70 uT) to 1.0 (strong detection >= 120 uT)
     */
    fun startAlertPulsing(scope: CoroutineScope, intensity: Float) {
        if (toneGenerator == null) return
        if (pulsingJob?.isActive == true) return

        pulsingJob = scope.launch(Dispatchers.Default) {
            while (isActive) {
                try {
                    // Play a short high-pitch chirp (TONE_PROP_BEEP or TONE_CDMA_PIP)
                    toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP, 55)
                } catch (e: Exception) {
                    Log.w("TonePlayer", "Error emitting tone", e)
                }

                // Cadence speeds up from 280ms down to 80ms as intensity approaches 1.0
                val clampedIntensity = intensity.coerceIn(0f, 1f)
                val delayMs = (280 - (clampedIntensity * 200)).toLong().coerceAtLeast(70L)
                delay(delayMs)
            }
        }
    }

    /**
     * Immediately stops any ongoing tone pulsing.
     */
    fun stopAlert() {
        pulsingJob?.cancel()
        pulsingJob = null
        try {
            toneGenerator?.stopTone()
        } catch (e: Exception) {
            // Ignore on stop
        }
    }

    /**
     * Release system resources on pause or destroy.
     */
    fun release() {
        stopAlert()
        try {
            toneGenerator?.release()
            toneGenerator = null
        } catch (e: Exception) {
            Log.w("TonePlayer", "Error releasing tone generator", e)
        }
    }
}
