package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.audio.TonePlayer
import com.example.sensor.MagnetometerManager
import com.example.vibration.VibrationHelper
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.sin

enum class StatusLevel {
    NORMAL_BACKGROUND,
    ELEVATED_FIELD,
    METAL_DETECTED
}

data class StudFinderUiState(
    val fluxDensity: Float = 45.0f,
    val rawFluxDensity: Float = 45.0f,
    val x: Float = 0f,
    val y: Float = 0f,
    val z: Float = 45f,
    val threshold: Float = 70.0f,
    val ambientBaseline: Float = 45.0f,
    val peakFluxDensity: Float = 45.0f,
    val statusLevel: StatusLevel = StatusLevel.NORMAL_BACKGROUND,
    val statusMessage: String = "Normal Background",
    val statusSubMessage: String = "Typical ambient geomagnetic field",
    val isMetalDetected: Boolean = false,
    val soundEnabled: Boolean = true,
    val vibrationEnabled: Boolean = true,
    val isHardwareSensorAvailable: Boolean = true,
    val isSimulating: Boolean = false,
    val simulationPosition: Float = 0.5f,
    val history: List<Float> = emptyList()
)

class StudFinderViewModel(application: Application) : AndroidViewModel(application) {

    private val sensorManager = MagnetometerManager(application.applicationContext)
    private val vibrationHelper = VibrationHelper(application.applicationContext)
    private val tonePlayer = TonePlayer()

    private val _uiState = MutableStateFlow(
        StudFinderUiState(
            isHardwareSensorAvailable = sensorManager.isHardwareSensorAvailable
        )
    )
    val uiState: StateFlow<StudFinderUiState> = _uiState.asStateFlow()

    private var vibrationAlertJob: Job? = null
    private var simulationSweepJob: Job? = null
    private var isSensorActive = false
    private var isAppInForeground = false

    init {
        // Collect sensor readings
        viewModelScope.launch {
            sensorManager.readingFlow.collect { reading ->
                if (!_uiState.value.isSimulating) {
                    processNewReading(reading.x, reading.y, reading.z, reading.magnitude, reading.rawMagnitude)
                }
            }
        }

        // If no hardware sensor, enable simulation mode gracefully
        if (!sensorManager.isHardwareSensorAvailable) {
            startSimulationSweep()
        }
    }

    private fun processNewReading(x: Float, y: Float, z: Float, magnitude: Float, rawMagnitude: Float) {
        val currentThreshold = _uiState.value.threshold
        val isDetected = magnitude >= currentThreshold

        val statusLevel = when {
            magnitude >= currentThreshold -> StatusLevel.METAL_DETECTED
            magnitude >= 52.0f -> StatusLevel.ELEVATED_FIELD
            else -> StatusLevel.NORMAL_BACKGROUND
        }

        val statusMsg = when (statusLevel) {
            StatusLevel.METAL_DETECTED -> "METAL DETECTED!"
            StatusLevel.ELEVATED_FIELD -> "Elevated Field"
            StatusLevel.NORMAL_BACKGROUND -> "Normal Background"
        }

        val subMsg = when (statusLevel) {
            StatusLevel.METAL_DETECTED -> "Fastener / Steel stud identified"
            StatusLevel.ELEVATED_FIELD -> "Approaching metallic anomaly"
            StatusLevel.NORMAL_BACKGROUND -> "Ambient background (40–50 µT)"
        }

        _uiState.update { current ->
            val newPeak = maxOf(current.peakFluxDensity, magnitude)
            val updatedHistory = (current.history + magnitude).takeLast(40)

            current.copy(
                fluxDensity = magnitude,
                rawFluxDensity = rawMagnitude,
                x = x,
                y = y,
                z = z,
                peakFluxDensity = newPeak,
                statusLevel = statusLevel,
                statusMessage = statusMsg,
                statusSubMessage = subMsg,
                isMetalDetected = isDetected,
                history = updatedHistory
            )
        }

        handleAlertTriggers(magnitude, currentThreshold, isDetected)
    }

    private fun handleAlertTriggers(magnitude: Float, threshold: Float, isDetected: Boolean) {
        if (!isAppInForeground) {
            stopAllAlerts()
            return
        }

        if (isDetected) {
            val delta = (magnitude - threshold).coerceAtLeast(0f)
            val intensity = (delta / 40f).coerceIn(0f, 1f)

            // Audio Alert
            if (_uiState.value.soundEnabled) {
                tonePlayer.startAlertPulsing(viewModelScope, intensity)
            } else {
                tonePlayer.stopAlert()
            }

            // Haptic Alert
            if (_uiState.value.vibrationEnabled) {
                triggerHapticPulseLoop(intensity)
            } else {
                vibrationAlertJob?.cancel()
                vibrationAlertJob = null
            }
        } else {
            stopAllAlerts()
        }
    }

    private fun triggerHapticPulseLoop(intensity: Float) {
        if (vibrationAlertJob?.isActive == true) return
        vibrationAlertJob = viewModelScope.launch {
            while (isActive) {
                vibrationHelper.vibrateAlertPulse(intensity)
                val delayMs = (280 - (intensity * 180)).toLong().coerceAtLeast(90L)
                delay(delayMs)
            }
        }
    }

    private fun stopAllAlerts() {
        tonePlayer.stopAlert()
        vibrationAlertJob?.cancel()
        vibrationAlertJob = null
        vibrationHelper.cancel()
    }

    // Lifecycle Management: unregister when paused or backgrounded
    fun onAppResume() {
        isAppInForeground = true
        if (!_uiState.value.isSimulating) {
            sensorManager.startListening()
            isSensorActive = true
        }
    }

    fun onAppPause() {
        isAppInForeground = false
        stopAllAlerts()
        sensorManager.stopListening()
        isSensorActive = false
    }

    fun toggleSound() {
        val newState = !_uiState.value.soundEnabled
        _uiState.update { it.copy(soundEnabled = newState) }
        if (!newState) {
            tonePlayer.stopAlert()
        }
    }

    fun toggleVibration() {
        val newState = !_uiState.value.vibrationEnabled
        _uiState.update { it.copy(vibrationEnabled = newState) }
        if (!newState) {
            vibrationAlertJob?.cancel()
            vibrationAlertJob = null
            vibrationHelper.cancel()
        }
    }

    fun updateThreshold(newThreshold: Float) {
        val clamped = newThreshold.coerceIn(50f, 130f)
        _uiState.update { it.copy(threshold = clamped) }
    }

    fun resetThresholdToDefault() {
        _uiState.update { it.copy(threshold = 70.0f) }
    }

    fun resetPeak() {
        _uiState.update { it.copy(peakFluxDensity = it.fluxDensity) }
    }

    fun toggleSimulation() {
        val nextSimulating = !_uiState.value.isSimulating
        _uiState.update { it.copy(isSimulating = nextSimulating) }
        if (nextSimulating) {
            sensorManager.stopListening()
            startSimulationSweep()
        } else {
            simulationSweepJob?.cancel()
            simulationSweepJob = null
            if (isAppInForeground) {
                sensorManager.startListening()
            }
        }
    }

    fun setSimulationPosition(position: Float) {
        _uiState.update { it.copy(simulationPosition = position) }
        // Compute simulated stud magnetic field curve (Lorentzian / Gaussian peak around center 0.5)
        // Baseline 44 uT, peaking at 98 uT at position 0.5
        val distFromCenter = kotlin.math.abs(position - 0.5f)
        val peakHeight = 58.0f // 44 + 58 = 102 uT
        val simulatedMag = 44.0f + (peakHeight / (1.0f + (distFromCenter * 16.0f) * (distFromCenter * 16.0f)))
        val simX = (simulatedMag * 0.35f * sin(position * 6.28f))
        val simY = (simulatedMag * 0.25f * cos(position * 6.28f))
        val simZ = (simulatedMag * 0.90f)

        processNewReading(simX, simY, simZ, simulatedMag, simulatedMag)
    }

    private fun startSimulationSweep() {
        _uiState.update { it.copy(isSimulating = true) }
        simulationSweepJob?.cancel()
        simulationSweepJob = viewModelScope.launch {
            var step = 0f
            while (isActive) {
                // Smooth sine wave sweep across a simulated wall with a metal stud
                val pos = (sin(step) + 1f) / 2f
                setSimulationPosition(pos)
                step += 0.05f
                delay(60)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopAllAlerts()
        sensorManager.stopListening()
        simulationSweepJob?.cancel()
        tonePlayer.release()
    }
}
