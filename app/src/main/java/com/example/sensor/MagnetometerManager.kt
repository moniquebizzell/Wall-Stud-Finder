package com.example.sensor

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.sqrt

data class MagneticReading(
    val x: Float = 0f,
    val y: Float = 0f,
    val z: Float = 0f,
    val magnitude: Float = 45f,
    val rawMagnitude: Float = 45f,
    val accuracy: Int = SensorManager.SENSOR_STATUS_ACCURACY_HIGH,
    val timestamp: Long = System.currentTimeMillis()
)

class MagnetometerManager(context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val magnetometer: Sensor? = sensorManager?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    private val _readingFlow = MutableStateFlow(MagneticReading())
    val readingFlow: StateFlow<MagneticReading> = _readingFlow.asStateFlow()

    val isHardwareSensorAvailable: Boolean = magnetometer != null

    private var isListening = false
    private var smoothedMagnitude = 45f
    private val alpha = 0.28f // Smoothing factor: balances instant response and needle stability

    fun startListening() {
        if (isListening || magnetometer == null || sensorManager == null) return
        // Use SENSOR_DELAY_UI for smooth 60fps gauge response with minimal battery impact
        sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_UI)
        isListening = true
    }

    fun stopListening() {
        if (!isListening || sensorManager == null) return
        sensorManager.unregisterListener(this)
        isListening = false
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null || event.sensor.type != Sensor.TYPE_MAGNETIC_FIELD) return

        val x = event.values[0]
        val y = event.values[1]
        val z = event.values[2]

        // Core Requirement: combined magnetic flux density via sqrt(x^2 + y^2 + z^2) in microteslas (µT)
        val rawMagnitude = sqrt(x * x + y * y + z * z)

        // Low-pass exponential moving average to eliminate jitter while keeping instant response
        smoothedMagnitude = (alpha * rawMagnitude) + ((1f - alpha) * smoothedMagnitude)

        _readingFlow.value = MagneticReading(
            x = x,
            y = y,
            z = z,
            magnitude = smoothedMagnitude,
            rawMagnitude = rawMagnitude,
            accuracy = event.accuracy,
            timestamp = System.currentTimeMillis()
        )
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Can be used to notify user if sensor needs calibration (figure-8 motion)
    }

    fun injectSimulatedReading(simulatedX: Float, simulatedY: Float, simulatedZ: Float) {
        val rawMag = sqrt(simulatedX * simulatedX + simulatedY * simulatedY + simulatedZ * simulatedZ)
        smoothedMagnitude = (alpha * rawMag) + ((1f - alpha) * smoothedMagnitude)
        _readingFlow.value = MagneticReading(
            x = simulatedX,
            y = simulatedY,
            z = simulatedZ,
            magnitude = smoothedMagnitude,
            rawMagnitude = rawMag,
            accuracy = SensorManager.SENSOR_STATUS_ACCURACY_HIGH,
            timestamp = System.currentTimeMillis()
        )
    }
}
