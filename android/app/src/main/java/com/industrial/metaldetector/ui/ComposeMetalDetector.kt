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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

// Industrial Hardware Palette
val BgGraphite = Color(0xFF0A0B0E)
val CardChassis = Color(0xFF15171D)
val BorderSteel = Color(0xFF2A2D35)
val BorderSubtle = Color(0xFF3A3E4A)
val AlertCrimson = Color(0xFFFF3E3E)
val PhosphorGreen = Color(0xFF00FF41)
val AndroidGreen = Color(0xFF3DDC84)
val WarningAmber = Color(0xFFFFA500)
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFFE0E0E0)
val TextMuted = Color(0xFF6A6E7A)

enum class AndroidNavDestination(val label: String) {
    DETECTOR("Detector"),
    STUD_FINDER("Stud Finder"),
    SCOPE("Flux Scope"),
    SETTINGS("Settings")
}

@OptIn(ExperimentalMaterial3Api::class)
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
    var selectedTab by remember { mutableStateOf(AndroidNavDestination.DETECTOR) }
    val isAlert = currentFlux >= threshold

    val animatedBgColor by animateColorAsState(
        targetValue = if (isAlert && isSensorActive) Color(0xFF180A0C) else BgGraphite,
        label = "bgColor"
    )

    // Dynamic descriptive status indicator per user requirement 2 & 3
    val statusText = when {
        !isSensorActive -> "LIFECYCLE: PAUSED // BATTERY SAVER"
        isAlert && selectedTab == AndroidNavDestination.STUD_FINDER -> "STUD / METAL DETECTED!"
        isAlert -> "METAL DETECTED!"
        currentFlux in 40f..50f -> "NORMAL BACKGROUND (40–50 µT)"
        currentFlux > 50f -> if (selectedTab == AndroidNavDestination.STUD_FINDER) "STUD IN PROXIMITY" else "ELEVATED FLUX"
        else -> "LOW BACKGROUND FIELD"
    }

    val statusColor = when {
        !isSensorActive -> WarningAmber
        isAlert -> AlertCrimson
        currentFlux in 40f..50f -> PhosphorGreen
        currentFlux > 50f -> WarningAmber
        else -> TextMuted
    }

    Scaffold(
        containerColor = animatedBgColor,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = when (selectedTab) {
                                AndroidNavDestination.DETECTOR -> "Metal Detector"
                                AndroidNavDestination.STUD_FINDER -> "Stud Finder"
                                AndroidNavDestination.SCOPE -> "Flux Scope"
                                AndroidNavDestination.SETTINGS -> "Settings & Hardware"
                            },
                            color = TextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = if (isAlert) "ANOMALY: > ${threshold.toInt()} µT" else "Sensor.TYPE_MAGNETIC_FIELD",
                            color = if (isAlert) AlertCrimson else TextMuted,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                },
                actions = {
                    if (selectedTab != AndroidNavDestination.SETTINGS) {
                        Button(
                            onClick = onTare,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (tareOffset > 0) WarningAmber.copy(alpha = 0.2f) else CardChassis
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (tareOffset > 0) WarningAmber else BorderSteel),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Text(
                                text = if (tareOffset > 0) "TARED" else "TARE",
                                color = if (tareOffset > 0) WarningAmber else TextSecondary,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF12141A)
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF12141A),
                contentColor = TextPrimary,
                tonalElevation = 8.dp
            ) {
                AndroidNavDestination.values().forEach { destination ->
                    val isSelected = selectedTab == destination
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedTab = destination },
                        label = {
                            Text(
                                text = destination.label,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        icon = {
                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .background(
                                        color = if (isSelected) (if (isAlert) AlertCrimson else AndroidGreen) else TextMuted,
                                        shape = CircleShape
                                    )
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color.Black,
                            selectedTextColor = if (isAlert) AlertCrimson else AndroidGreen,
                            unselectedTextColor = TextMuted,
                            indicatorColor = if (isAlert) AlertCrimson.copy(alpha = 0.3f) else AndroidGreen.copy(alpha = 0.2f)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            when (selectedTab) {
                AndroidNavDestination.DETECTOR -> {
                    // Status placard
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

                    // Circular Industrial Gauge (Core Requirement 1)
                    ComposeIndustrialGauge(
                        flux = currentFlux,
                        threshold = threshold,
                        isAlert = isAlert,
                        statusText = statusText,
                        statusColor = statusColor,
                        modifier = Modifier
                            .size(300.dp)
                            .padding(vertical = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Vector Breakdown
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
                                Text(text = "ORTHOGONAL VECTORS", color = TextMuted, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                Text(text = "PEAK: ${"%.1f".format(peakFlux)} µT", color = TextPrimary, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                            }

                            VectorChannelRow(label = "X-AXIS (PITCH)", value = rawX, threshold = threshold)
                            VectorChannelRow(label = "Y-AXIS (ROLL)", value = rawY, threshold = threshold)
                            VectorChannelRow(label = "Z-AXIS (AZIMUTH)", value = rawZ, threshold = threshold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Quick Tare & Reset Controls
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onTare,
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = CardChassis),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderSteel)
                        ) {
                            Text(
                                text = if (tareOffset > 0f) "CLEAR TARE" else "TARE BASELINE",
                                color = if (tareOffset > 0f) WarningAmber else TextPrimary,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Button(
                            onClick = onResetPeak,
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = CardChassis),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderSteel)
                        ) {
                            Text(text = "RESET PEAK", color = TextMuted, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                        }
                    }
                }

                AndroidNavDestination.STUD_FINDER -> {
                    // Stud Finder Dedicated Screen
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(CardChassis, RoundedCornerShape(12.dp))
                            .border(1.dp, if (isAlert) AlertCrimson else BorderSteel, RoundedCornerShape(12.dp))
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "WALL STUD SCANNER", color = AndroidGreen, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(16.dp))

                            Box(
                                modifier = Modifier
                                    .size(200.dp)
                                    .background(BgGraphite, CircleShape)
                                    .border(2.dp, if (isAlert) AlertCrimson else AndroidGreen, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "${"%.1f".format(currentFlux)}",
                                        color = if (isAlert) AlertCrimson else TextPrimary,
                                        fontSize = 36.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(text = "µT DENSITY", color = TextMuted, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = if (isAlert) "STUD DETECTED" else "NORMAL WALL",
                                        color = if (isAlert) AlertCrimson else PhosphorGreen,
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = onTare,
                                modifier = Modifier.fillMaxWidth().height(44.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = CardChassis),
                                border = androidx.compose.foundation.BorderStroke(1.dp, BorderSteel)
                            ) {
                                Text(text = "CALIBRATE WALL BASELINE", color = AndroidGreen, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                            }
                        }
                    }
                }

                AndroidNavDestination.SCOPE -> {
                    // Flux Scope Telemetry Screen
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(CardChassis, RoundedCornerShape(12.dp))
                            .border(1.dp, BorderSteel, RoundedCornerShape(12.dp))
                            .padding(16.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text(text = "REAL-TIME FLUX TELEMETRY", color = AndroidGreen, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                            Text(text = "Ambient Earth Field Band: 40.0 – 50.0 µT", color = PhosphorGreen, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                            Text(text = "Detection Alert Threshold: ${threshold.toInt()} µT", color = AlertCrimson, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                            Text(text = "Current Value: ${"%.1f".format(currentFlux)} µT", color = TextPrimary, fontSize = 14.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                            Text(text = "Peak Recorded: ${"%.1f".format(peakFlux)} µT", color = TextSecondary, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }
                    }
                }

                AndroidNavDestination.SETTINGS -> {
                    // Settings Screen
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(CardChassis, RoundedCornerShape(12.dp))
                                .border(1.dp, BorderSteel, RoundedCornerShape(12.dp))
                                .padding(14.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(text = "ALERT THRESHOLD: ${threshold.toInt()} µT", color = AlertCrimson, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                                Slider(
                                    value = threshold,
                                    onValueChange = onChangeThreshold,
                                    valueRange = 50f..120f,
                                    colors = SliderDefaults.colors(
                                        thumbColor = AlertCrimson,
                                        activeTrackColor = AlertCrimson
                                    )
                                )
                                Text(text = "Ambient background is typically 40–50 µT.", color = TextMuted, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                            }
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(CardChassis, RoundedCornerShape(12.dp))
                                .border(1.dp, BorderSteel, RoundedCornerShape(12.dp))
                                .padding(14.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text(text = "FEEDBACK CHANNELS", color = TextPrimary, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = "Audible Alert (ToneGenerator)", color = TextSecondary, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Switch(checked = isAudioEnabled, onCheckedChange = { onToggleAudio() })
                                }
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = "Haptic Vibration (Vibrator)", color = TextSecondary, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Switch(checked = isHapticsEnabled, onCheckedChange = { onToggleHaptics() })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun VectorChannelRow(label: String, value: Float, threshold: Float) {
    val pct = (abs(value) / 120f).coerceIn(0f, 1f)
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, color = TextMuted, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
            Text(
                text = "${if (value > 0) "+" else ""}${"%.1f".format(value)} µT",
                color = TextSecondary,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace
            )
        }
        Spacer(modifier = Modifier.height(3.dp))
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
                    .background(if (abs(value) >= threshold * 0.7f) AlertCrimson else AndroidGreen, CircleShape)
            )
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

            // Outer dial chassis
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

            // Base track (270 deg sweep)
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

            // Normal Ambient Arc (40 to 50 µT)
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
                color = AlertCrimson.copy(alpha = 0.8f),
                startAngle = dangerStart,
                sweepAngle = dangerSweep,
                useCenter = false,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = 6.dp.toPx())
            )

            // Needle Pointer
            rotate(degrees = animatedAngle, pivot = center) {
                drawLine(
                    color = if (isAlert) AlertCrimson else AndroidGreen,
                    start = center,
                    end = Offset(center.x, center.y - radius + 10.dp.toPx()),
                    strokeWidth = 3.dp.toPx(),
                    cap = StrokeCap.Round
                )
            }

            // Pivot Center Knob
            drawCircle(color = if (isAlert) AlertCrimson else AndroidGreen, radius = 6.dp.toPx(), center = center)
        }

        // Digital Value Inside Center Dial
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 70.dp)
        ) {
            Text(
                text = "${"%.1f".format(flux)}",
                color = if (isAlert) AlertCrimson else TextPrimary,
                fontSize = 42.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "µT (MICROTESLA)",
                color = if (isAlert) AlertCrimson else TextMuted,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
