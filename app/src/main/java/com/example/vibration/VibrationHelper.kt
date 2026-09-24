package com.example.vibration

import android.content.Context
import android.os.Build
import android.os.CombinedVibration
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

/**
 * Handles haptic vibration feedback when metal stud is detected.
 */
class VibrationHelper(private val context: Context) {

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    /**
     * Vibrate for a short click or alert pulse.
     */
    fun vibrateAlertPulse(intensity: Float = 0.5f) {
        if (vibrator == null || !vibrator.hasVibrator()) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val amplitude = (intensity.coerceIn(0.1f, 1.0f) * 255).toInt().coerceIn(1, 255)
                val effect = VibrationEffect.createOneShot(50, amplitude)
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(50)
            }
        } catch (e: Exception) {
            Log.w("VibrationHelper", "Vibration failed", e)
        }
    }

    /**
     * Cancel ongoing vibration immediately.
     */
    fun cancel() {
        try {
            vibrator?.cancel()
        } catch (e: Exception) {
            // Ignore
        }
    }
}
