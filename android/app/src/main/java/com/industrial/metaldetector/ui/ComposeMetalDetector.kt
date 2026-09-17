package com.industrial.metaldetector.ui

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
                    text = if (isAlert) "ALERT ACTIVE" else "THRESHOLD: ${threshold.toInt()} µT",
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
                        text = "Peak: ${"%.1f".format(peakFlux)} µT",
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
                text = "${if (value >= 0) "+" else ""}${"%.1f".format(value)} µT",
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
}
