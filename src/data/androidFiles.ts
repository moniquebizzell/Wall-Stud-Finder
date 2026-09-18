export interface AndroidSourceFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidSourceFile[] = [
  {
    path: 'app/src/main/java/com/industrial/metaldetector/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Main Activity: Sensor.TYPE_MAGNETIC_FIELD, sqrt(x^2+y^2+z^2), onPause() lifecycle battery preservation, vibrator & tone generator',
    content: `package com.industrial.metaldetector

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
}`
  },
  {
    path: 'app/src/main/java/com/industrial/metaldetector/ui/ComposeMetalDetector.kt',
    filename: 'ComposeMetalDetector.kt',
    language: 'kotlin',
    description: 'Jetpack Compose UI: Circular dial gauge, exact numeric readout, dynamic descriptive status indicator, 40-50 µT ambient & 70 µT alert zone',
    content: `package com.industrial.metaldetector.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.abs

// Industrial Hardware Palette (Recipe 3)
val BgGraphite = Color(0xFF0A0B0E)
val CardChassis = Color(0xFF15171D)
val BorderSteel = Color(0xFF2A2D35)
val BorderSubtle = Color(0xFF3A3E4A)
val AlertCrimson = Color(0xFFFF3E3E)
val PhosphorGreen = Color(0xFF00FF41)
val WarningAmber = Color(0xFFFFA500)
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFFE0E0E0)
val TextMuted = Color(0xFF6A6E7A)

@Composable
fun ComposeMetalDetectorScreen(
    currentFlux: Float,
    rawX: Float,
    rawY: Float,
    rawZ: Float,
    peakFlux: Float,
    threshold: Float,
    tareOffset: Float,
    isAudioEnabled: Boolean,
    isHapticsEnabled: Boolean,
    isSensorActive: Boolean,
    isStudFinderMode: Boolean,
    onToggleMode: () -> Unit,
    onToggleAudio: () -> Unit,
    onToggleHaptics: () -> Unit,
    onTare: () -> Unit,
    onResetPeak: () -> Unit,
    onChangeThreshold: (Float) -> Unit
) {
    val isAlert = currentFlux >= threshold
    val animatedBgColor by animateColorAsState(
        targetValue = if (isAlert) Color(0xFF180A0C) else BgGraphite,
        label = "bgColor"
    )

    // Dynamic descriptive status indicator per user requirement 2 & 3
    val statusText = when {
        isAlert && isStudFinderMode -> "STUD / METAL DETECTED!"
        isAlert -> "METAL DETECTED!"
        currentFlux in 40f..50f -> "NORMAL BACKGROUND"
        currentFlux > 50f -> if (isStudFinderMode) "STUD IN PROXIMITY" else "ELEVATED FLUX"
        else -> "LOW BACKGROUND FIELD"
    }

    val statusColor = when {
        isAlert -> AlertCrimson
        currentFlux in 40f..50f -> PhosphorGreen
        currentFlux > 50f -> WarningAmber
        else -> TextMuted
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(animatedBgColor)
            .statusBarsPadding()
            .navigationBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Header: Industrial Monospace Branding
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "MAG-TECH 4000",
                    color = TextPrimary,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = if (isStudFinderMode) "MAGNETIC STUD FINDER // V4.2" else "METAL DETECTOR UTILITY // V4.2",
                    color = TextMuted,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.sp
                )
            }

            Box(
                modifier = Modifier
                    .background(
                        color = if (isSensorActive) PhosphorGreen.copy(alpha = 0.15f) else AlertCrimson.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(4.dp)
                    )
                    .border(
                        width = 1.dp,
                        color = if (isSensorActive) PhosphorGreen else AlertCrimson,
                        shape = RoundedCornerShape(4.dp)
                    )
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = if (isSensorActive) "SENSOR LIVE" else "PAUSED (OFFLINE)",
                    color = if (isSensorActive) PhosphorGreen else AlertCrimson,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Mode Switcher: Metal Detector vs Magnetic Stud Finder
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp)
                .background(CardChassis, RoundedCornerShape(8.dp))
                .border(1.dp, BorderSteel, RoundedCornerShape(8.dp))
                .padding(3.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Button(
                onClick = { if (isStudFinderMode) onToggleMode() },
                modifier = Modifier.weight(1f).height(32.dp),
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (!isStudFinderMode) BorderSteel else Color.Transparent
                ),
                contentPadding = PaddingValues(0.dp)
            ) {
                Text(
                    text = "METAL DETECTOR",
                    color = if (!isStudFinderMode) TextPrimary else TextMuted,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }

            Button(
                onClick = { if (!isStudFinderMode) onToggleMode() },
                modifier = Modifier.weight(1f).height(32.dp),
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isStudFinderMode) BorderSteel else Color.Transparent
                ),
                contentPadding = PaddingValues(0.dp)
            ) {
                Text(
                    text = "STUD FINDER",
                    color = if (isStudFinderMode) TextPrimary else TextMuted,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Top Alert Banner (turns red on > 70 µT)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
                .background(
                    if (isAlert) AlertCrimson.copy(alpha = 0.2f) else CardChassis,
                    RoundedCornerShape(8.dp)
                )
                .border(
                    1.dp,
                    if (isAlert) AlertCrimson else BorderSteel,
                    RoundedCornerShape(8.dp)
                )
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = statusText,
                    color = statusColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = if (isAlert) "ALERT ACTIVE" else "THRESHOLD: \${threshold.toInt()} µT",
                    color = if (isAlert) AlertCrimson else TextMuted,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // Core Requirement 1: Center Industrial Circular Dial Gauge
        ComposeIndustrialGauge(
            flux = currentFlux,
            threshold = threshold,
            isAlert = isAlert,
            statusText = statusText,
            statusColor = statusColor,
            modifier = Modifier
                .size(310.dp)
                .padding(vertical = 4.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Vector Breakdown & Peak Readout
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardChassis, RoundedCornerShape(12.dp))
                .border(1.dp, if (isAlert) AlertCrimson else BorderSteel, RoundedCornerShape(12.dp))
                .padding(14.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "3-AXIS MAGNETOMETER (µT)",
                        color = TextMuted,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (isAlert) "ANOMALY DETECTED" else "AMBIENT FIELD (40-50µT)",
                        color = if (isAlert) AlertCrimson else PhosphorGreen,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                VectorBar(label = "X-AXIS (Bx)", value = rawX, threshold = threshold)
                VectorBar(label = "Y-AXIS (By)", value = rawY, threshold = threshold)
                VectorBar(label = "Z-AXIS (Bz)", value = rawZ, threshold = threshold)

                Divider(color = BorderSteel, thickness = 1.dp, modifier = Modifier.padding(vertical = 4.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Peak: \${"%.1f".format(peakFlux)} µT",
                        color = TextPrimary,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    Button(
                        onClick = onResetPeak,
                        colors = ButtonDefaults.buttonColors(containerColor = BorderSteel),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text("RESET PEAK", fontSize = 9.sp, color = TextSecondary, fontFamily = FontFamily.Monospace)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Hardware Controls: Audio, Haptics, Tare Zeroing
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ControlToggleButton(
                label = "AUDIO",
                subLabel = if (isAudioEnabled) "TONE ON" else "MUTED",
                isActive = isAudioEnabled,
                onClick = onToggleAudio,
                modifier = Modifier.weight(1f)
            )
            ControlToggleButton(
                label = "HAPTIC",
                subLabel = if (isHapticsEnabled) "VIBRATE ON" else "OFF",
                isActive = isHapticsEnabled,
                onClick = onToggleHaptics,
                modifier = Modifier.weight(1f)
            )
            ControlToggleButton(
                label = "TARE / ZERO",
                subLabel = if (tareOffset > 0f) "ZEROED" else "CALIBRATE",
                isActive = tareOffset > 0f,
                onClick = onTare,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun VectorBar(label: String, value: Float, threshold: Float) {
    val pct = (abs(value) / 100f).coerceIn(0.04f, 1f)
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, color = TextMuted, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
            Text(
                text = "\${if (value >= 0) "+" else ""}\${"%.1f".format(value)} µT",
                color = TextSecondary,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .background(Color(0xFF1A1C23), CircleShape)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(pct)
                    .fillMaxHeight()
                    .background(if (abs(value) >= threshold * 0.7f) AlertCrimson else TextPrimary.copy(alpha = 0.3f), CircleShape)
            )
        }
    }
}

@Composable
fun ControlToggleButton(
    label: String,
    subLabel: String,
    isActive: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(62.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isActive) BorderSteel else CardChassis
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, if (isActive) BorderSubtle else BorderSteel),
        contentPadding = PaddingValues(4.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = label, color = TextPrimary, fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
            Text(text = subLabel, color = if (isActive) PhosphorGreen else TextMuted, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
        }
    }
}

@Composable
fun ComposeIndustrialGauge(
    flux: Float,
    threshold: Float,
    isAlert: Boolean,
    statusText: String,
    statusColor: Color,
    modifier: Modifier = Modifier
) {
    // 0 to 200 µT mapped to -135 to +135 degrees (270 degree span)
    val clamped = flux.coerceIn(0f, 200f)
    val targetAngle = -135f + (clamped / 200f) * 270f
    val animatedAngle by animateFloatAsState(
        targetValue = targetAngle,
        animationSpec = spring(dampingRatio = 0.65f, stiffness = 120f),
        label = "needleAngle"
    )

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val radius = size.minDimension / 2f - 16.dp.toPx()

            // Outer industrial dial chassis
            drawCircle(
                color = CardChassis,
                radius = radius + 12.dp.toPx(),
                center = center
            )
            drawCircle(
                color = if (isAlert) AlertCrimson else BorderSteel,
                radius = radius + 12.dp.toPx(),
                center = center,
                style = Stroke(width = 4.dp.toPx())
            )

            // Base track (-135 to +135 degrees = 270 deg sweep)
            val startAngle = 135f
            drawArc(
                color = BorderSteel,
                startAngle = startAngle,
                sweepAngle = 270f,
                useCenter = false,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round)
            )

            // Normal Ambient Background Arc (40 to 50 µT)
            val ambientStart = startAngle + (40f / 200f) * 270f
            val ambientSweep = (10f / 200f) * 270f
            drawArc(
                color = PhosphorGreen,
                startAngle = ambientStart,
                sweepAngle = ambientSweep,
                useCenter = false,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = 6.dp.toPx())
            )

            // Danger Zone Arc (70 to 200 µT)
            val dangerStart = startAngle + (threshold / 200f) * 270f
            val dangerSweep = ((200f - threshold) / 200f) * 270f
            drawArc(
                color = AlertCrimson,
                startAngle = dangerStart,
                sweepAngle = dangerSweep,
                useCenter = false,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
            )

            // Rotating Needle
            rotate(degrees = animatedAngle, pivot = center) {
                // Needle blade
                drawLine(
                    color = if (isAlert) AlertCrimson else TextPrimary,
                    start = Offset(center.x, center.y + 20.dp.toPx()),
                    end = Offset(center.x, center.y - radius + 6.dp.toPx()),
                    strokeWidth = 3.5.dp.toPx(),
                    cap = StrokeCap.Round
                )
                // Red indicator tip
                drawLine(
                    color = AlertCrimson,
                    start = Offset(center.x, center.y - radius + 16.dp.toPx()),
                    end = Offset(center.x, center.y - radius + 6.dp.toPx()),
                    strokeWidth = 4.dp.toPx(),
                    cap = StrokeCap.Round
                )
                // Center hub
                drawCircle(color = BorderSteel, radius = 12.dp.toPx(), center = center)
                drawCircle(color = if (isAlert) AlertCrimson else TextSecondary, radius = 5.dp.toPx(), center = center)
            }
        }

        // Center Digital Readout + Dynamic Descriptive Status
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 75.dp)
        ) {
            Text(
                text = "FLUX DENSITY",
                color = TextMuted,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = "%.1f".format(flux),
                    color = if (isAlert) AlertCrimson else TextPrimary,
                    fontSize = 44.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "µT",
                    color = AlertCrimson,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(bottom = 6.dp, start = 2.dp)
                )
            }

            // Descriptive Dynamic Status Badge
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .background(
                        color = statusColor.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(4.dp)
                    )
                    .border(
                        width = 1.dp,
                        color = statusColor,
                        shape = RoundedCornerShape(4.dp)
                    )
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = statusText,
                    color = statusColor,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Android manifest with VIBRATE, HIGH_SAMPLING_RATE_SENSORS, and compass sensor requirement',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.industrial.metaldetector">

    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />

    <uses-feature
        android:name="android.hardware.sensor.compass"
        android:required="true" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MetalDetector">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'App-level Gradle script with Jetpack Compose BOM, Material3, and Core KTX',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.industrial.metaldetector"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.industrial.metaldetector"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "4.2.1"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.activity:activity-compose:1.9.1")
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.material3:material3")
}`
  },
  {
    path: 'README.md',
    filename: 'README.md',
    language: 'markdown',
    description: 'Build & deployment instructions for Android Studio',
    content: `# Metal Detector & Magnetic Stud Finder (Native Android / Kotlin / Compose)

A native Android utility utilizing the device's internal magnetometer (\`Sensor.TYPE_MAGNETIC_FIELD\`) to detect ferrous metals, structural steel wall studs, and screws.

## Core Implementations:
1. **Circular Dial Gauge**: Industrial-style Compose Canvas rendering combined flux density \`sqrt(x^2 + y^2 + z^2)\` in microteslas (µT).
2. **Numeric Readout & Dynamic Status**: Real-time numerical readout with status indicators ("Normal Background", "Stud In Proximity", "Metal Detected!").
3. **Ambient Baseline & Alert**: 40–50 µT marked ambient baseline, 70 µT detection trigger.
4. **Hardware Alerts**: Turn gauge and background accents red, trigger \`VibrationEffect\` continuous waveform, and emit audible alert beeps via \`ToneGenerator\`.
5. **Lifecycle Management**: Unregisters sensor listener on \`onPause()\` to preserve battery life. Entirely offline with no login screens.

## Quick Start
1. Extract the downloaded ZIP or clone the repository.
2. In Android Studio, select **File > Open** and choose this directory.
3. Sync Gradle and click **Run (Shift+F10)** on a connected Android phone.`
  },
  {
    path: 'PLAY_CONSOLE_GUIDE.md',
    filename: 'PLAY_CONSOLE_GUIDE.md',
    language: 'markdown',
    description: 'Step-by-step guide to signing and uploading the App Bundle (.aab) to Google Play Console',
    content: `# Google Play Console Publishing Guide
## Industrial Metal Detector & Stud Finder (com.industrial.metaldetector)

### 1. Generate Upload Keystore
Run in terminal:
\`\`\`bash
keytool -genkey -v -keystore release.keystore -alias metaldetector -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

### 2. Generate Signed Android App Bundle (.aab)
\`\`\`bash
./gradlew bundleRelease
\`\`\`
Output bundle:
\`app/build/outputs/bundle/release/app-release.aab\`

### 3. Google Play Console Setup
- App Title: Industrial Metal Detector & Stud Finder
- Category: Tools
- Content Rating: Everyone
- Data Safety: No user data collected or shared (100% offline, zero network permissions)
- Target SDK: 35 (Android 15)`
  },
  {
    path: 'app/proguard-rules.pro',
    filename: 'proguard-rules.pro',
    language: 'groovy',
    description: 'ProGuard/R8 optimization rules for Jetpack Compose & SensorEventListener',
    content: `-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**
-keepclassmembers class * implements android.hardware.SensorEventListener {
    public void onSensorChanged(android.hardware.SensorEvent);
    public void onAccuracyChanged(android.hardware.Sensor, int);
}
-keepattributes *Annotation*,InnerClasses,EnclosingMethod`
  }
];
