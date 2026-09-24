package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.ElectricBolt
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AlertRed
import com.example.ui.theme.AlertRedDeep
import com.example.ui.theme.AlertRedGlow
import com.example.ui.theme.DarkBackground
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceBorder
import com.example.ui.theme.DarkSurfaceVariant
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.ElevatedAmber
import com.example.ui.theme.GaugeBackground
import com.example.ui.theme.NeedleColorAlert
import com.example.ui.theme.NeedleColorNormal
import com.example.ui.theme.NeedlePivot
import com.example.ui.theme.NormalGreen
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary
import com.example.viewmodel.StatusLevel
import java.util.Locale
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

private const val START_ANGLE = 135f
private const val TOTAL_SWEEP = 270f
private const val MAX_GAUGE_UT = 150f

@Composable
fun CircularDialGauge(
    fluxDensity: Float,
    threshold: Float,
    peakFluxDensity: Float,
    statusLevel: StatusLevel,
    isMetalDetected: Boolean,
    modifier: Modifier = Modifier
) {
    // Smooth needle animation with spring-like response
    val animatedFlux by animateFloatAsState(
        targetValue = fluxDensity.coerceIn(0f, MAX_GAUGE_UT),
        animationSpec = tween(durationMillis = 160, easing = FastOutSlowInEasing),
        label = "flux_gauge_needle"
    )

    // Pulsing alert animation for metal detected state
    val infiniteTransition = rememberInfiniteTransition(label = "alert_pulse")
    val alertPulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.25f,
        targetValue = 0.75f,
        animationSpec = infiniteRepeatable(
            animation = tween(400),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alert_glow_alpha"
    )

    // Dynamic accent color: Green/Cyan for normal, Amber for elevated, Red for metal detected
    val dynamicAccentColor by animateColorAsState(
        targetValue = when (statusLevel) {
            StatusLevel.METAL_DETECTED -> AlertRed
            StatusLevel.ELEVATED_FIELD -> ElevatedAmber
            StatusLevel.NORMAL_BACKGROUND -> NormalGreen
        },
        animationSpec = tween(250),
        label = "accent_color"
    )

    Box(
        modifier = modifier
            .testTag("circular_dial_gauge")
            .fillMaxWidth()
            .aspectRatio(1f),
        contentAlignment = Alignment.Center
    ) {
        // Background Alert Glow Aura when metal detected
        if (isMetalDetected) {
            Box(
                modifier = Modifier
                    .fillMaxSize(0.95f)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                AlertRed.copy(alpha = 0.40f * alertPulseAlpha),
                                AlertRedDeep,
                                Color.Transparent
                            )
                        )
                    )
            )
        }

        // Custom Canvas for Dial Tracks, Ticks, Threshold Flag, and Precision Needle
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp)
        ) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val outerRadius = (size.minDimension / 2f) - 10.dp.toPx()
            val trackRadius = outerRadius - 16.dp.toPx()
            val trackStroke = 14.dp.toPx()

            // 1. Dial Base Background Disc
            drawCircle(
                color = GaugeBackground,
                radius = outerRadius,
                center = center
            )
            drawCircle(
                color = if (isMetalDetected) AlertRed.copy(alpha = 0.8f) else DarkSurfaceBorder,
                radius = outerRadius,
                center = center,
                style = Stroke(width = if (isMetalDetected) 3.dp.toPx() else 1.5.dp.toPx())
            )

            // 2. Dial Arc Tracks (Normal Zone, Elevated Zone, Metal Zone)
            drawDialTracks(
                center = center,
                radius = trackRadius,
                strokeWidth = trackStroke,
                threshold = threshold,
                isMetalDetected = isMetalDetected
            )

            // 3. Tick Marks & Numbers
            drawTickMarks(
                center = center,
                radius = outerRadius,
                threshold = threshold
            )

            // 4. Threshold Target Indicator Pin
            drawThresholdMarker(
                center = center,
                radius = trackRadius,
                threshold = threshold
            )

            // 5. Peak Memory Hold Mark
            drawPeakMarker(
                center = center,
                radius = trackRadius,
                peakVal = peakFluxDensity
            )

            // 6. Active Needle with Pivot
            drawNeedle(
                center = center,
                needleLength = trackRadius - 8.dp.toPx(),
                value = animatedFlux,
                isMetalDetected = isMetalDetected,
                accentColor = dynamicAccentColor
            )
        }

        // Center Digital Readout & Status Pill
        CenterReadout(
            fluxDensity = fluxDensity,
            peakFluxDensity = peakFluxDensity,
            threshold = threshold,
            statusLevel = statusLevel,
            isMetalDetected = isMetalDetected,
            accentColor = dynamicAccentColor,
            alertPulseAlpha = if (isMetalDetected) alertPulseAlpha else 1f
        )
    }
}

private fun DrawScope.drawDialTracks(
    center: Offset,
    radius: Float,
    strokeWidth: Float,
    threshold: Float,
    isMetalDetected: Boolean
) {
    val sizeRect = Size(radius * 2f, radius * 2f)
    val topLeft = Offset(center.x - radius, center.y - radius)

    // Base muted track
    drawArc(
        color = DarkSurfaceVariant,
        startAngle = START_ANGLE,
        sweepAngle = TOTAL_SWEEP,
        useCenter = false,
        topLeft = topLeft,
        size = sizeRect,
        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
    )

    // Normal ambient background zone (0 to 50 µT) -> 0..33.3% of 270 deg = 90 deg
    val normalSweep = (50f / MAX_GAUGE_UT) * TOTAL_SWEEP
    drawArc(
        color = NormalGreen.copy(alpha = if (isMetalDetected) 0.35f else 0.85f),
        startAngle = START_ANGLE,
        sweepAngle = normalSweep,
        useCenter = false,
        topLeft = topLeft,
        size = sizeRect,
        style = Stroke(width = strokeWidth, cap = StrokeCap.Butt)
    )

    // Elevated anomaly zone (50 to threshold µT, default 70)
    val elevatedSweep = ((threshold - 50f) / MAX_GAUGE_UT) * TOTAL_SWEEP
    drawArc(
        color = ElevatedAmber.copy(alpha = if (isMetalDetected) 0.45f else 0.90f),
        startAngle = START_ANGLE + normalSweep,
        sweepAngle = elevatedSweep,
        useCenter = false,
        topLeft = topLeft,
        size = sizeRect,
        style = Stroke(width = strokeWidth, cap = StrokeCap.Butt)
    )

    // Metal Alert Detection zone (threshold to 150 µT)
    val alertSweep = ((MAX_GAUGE_UT - threshold) / MAX_GAUGE_UT) * TOTAL_SWEEP
    drawArc(
        color = if (isMetalDetected) AlertRed else AlertRed.copy(alpha = 0.65f),
        startAngle = START_ANGLE + normalSweep + elevatedSweep,
        sweepAngle = alertSweep,
        useCenter = false,
        topLeft = topLeft,
        size = sizeRect,
        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
    )
}

private fun DrawScope.drawTickMarks(
    center: Offset,
    radius: Float,
    threshold: Float
) {
    val totalSteps = 30 // each 5 uT (0..150)
    val sweepPerStep = TOTAL_SWEEP / totalSteps

    val paint = android.graphics.Paint().apply {
        color = android.graphics.Color.parseColor("#94A3B8")
        textSize = 10.dp.toPx()
        textAlign = android.graphics.Paint.Align.CENTER
        isAntiAlias = true
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.MONOSPACE, android.graphics.Typeface.BOLD)
    }

    for (i in 0..totalSteps) {
        val currentUT = i * 5
        val isMajor = currentUT % 25 == 0
        val isThreshold = kotlin.math.abs(currentUT - threshold.toInt()) <= 2

        val angleDeg = START_ANGLE + (i * sweepPerStep)
        val angleRad = (angleDeg * PI / 180.0).toFloat()

        val tickLength = when {
            isThreshold -> 16.dp.toPx()
            isMajor -> 13.dp.toPx()
            else -> 6.dp.toPx()
        }

        val strokeW = when {
            isThreshold -> 3.5.dp.toPx()
            isMajor -> 2.2.dp.toPx()
            else -> 1.0.dp.toPx()
        }

        val tickColor = when {
            isThreshold -> AlertRed
            currentUT >= 70 -> AlertRedGlow
            currentUT >= 50 -> ElevatedAmber
            else -> TextSecondary
        }

        val startR = radius - 4.dp.toPx()
        val endR = startR - tickLength

        val p1 = Offset(
            center.x + (startR * cos(angleRad)),
            center.y + (startR * sin(angleRad))
        )
        val p2 = Offset(
            center.x + (endR * cos(angleRad)),
            center.y + (endR * sin(angleRad))
        )

        drawLine(
            color = tickColor,
            start = p1,
            end = p2,
            strokeWidth = strokeW,
            cap = StrokeCap.Round
        )

        // Draw major numeric labels (0, 50, 100, 150)
        if (isMajor) {
            val textR = endR - 10.dp.toPx()
            val textX = center.x + (textR * cos(angleRad))
            val textY = center.y + (textR * sin(angleRad)) + 4.dp.toPx()

            paint.color = if (currentUT >= 70) android.graphics.Color.parseColor("#FF2A4B")
                          else android.graphics.Color.parseColor("#94A3B8")

            drawContext.canvas.nativeCanvas.drawText(
                "$currentUT",
                textX,
                textY,
                paint
            )
        }
    }
}

private fun DrawScope.drawThresholdMarker(
    center: Offset,
    radius: Float,
    threshold: Float
) {
    val angleDeg = START_ANGLE + ((threshold.coerceIn(0f, MAX_GAUGE_UT) / MAX_GAUGE_UT) * TOTAL_SWEEP)
    val angleRad = (angleDeg * PI / 180.0).toFloat()

    val markerRadius = radius + 15.dp.toPx()
    val tipX = center.x + (markerRadius * cos(angleRad))
    val tipY = center.y + (markerRadius * sin(angleRad))

    // Draw little arrow / flag pointing inward
    drawCircle(
        color = AlertRed,
        radius = 4.dp.toPx(),
        center = Offset(tipX, tipY)
    )
}

private fun DrawScope.drawPeakMarker(
    center: Offset,
    radius: Float,
    peakVal: Float
) {
    if (peakVal <= 0f) return
    val angleDeg = START_ANGLE + ((peakVal.coerceIn(0f, MAX_GAUGE_UT) / MAX_GAUGE_UT) * TOTAL_SWEEP)
    val angleRad = (angleDeg * PI / 180.0).toFloat()

    val outerR = radius + 6.dp.toPx()
    val innerR = radius - 6.dp.toPx()

    drawLine(
        color = ElectricCyan,
        start = Offset(center.x + (innerR * cos(angleRad)), center.y + (innerR * sin(angleRad))),
        end = Offset(center.x + (outerR * cos(angleRad)), center.y + (outerR * sin(angleRad))),
        strokeWidth = 2.5.dp.toPx(),
        cap = StrokeCap.Round
    )
}

private fun DrawScope.drawNeedle(
    center: Offset,
    needleLength: Float,
    value: Float,
    isMetalDetected: Boolean,
    accentColor: Color
) {
    val angleDeg = START_ANGLE + ((value / MAX_GAUGE_UT) * TOTAL_SWEEP)

    rotate(degrees = angleDeg + 90f, pivot = center) {
        val needlePath = Path().apply {
            moveTo(center.x - 3.5.dp.toPx(), center.y)
            lineTo(center.x, center.y - needleLength)
            lineTo(center.x + 3.5.dp.toPx(), center.y)
            lineTo(center.x + 1.5.dp.toPx(), center.y + 16.dp.toPx())
            lineTo(center.x - 1.5.dp.toPx(), center.y + 16.dp.toPx())
            close()
        }

        // Needle body
        drawPath(
            path = needlePath,
            color = if (isMetalDetected) NeedleColorAlert else NeedleColorNormal
        )

        // Needle tip highlight
        drawCircle(
            color = if (isMetalDetected) Color.White else ElectricCyan,
            radius = 3.dp.toPx(),
            center = Offset(center.x, center.y - needleLength)
        )
    }

    // Needle Pivot Hub
    drawCircle(
        color = DarkBackground,
        radius = 16.dp.toPx(),
        center = center
    )
    drawCircle(
        color = if (isMetalDetected) AlertRed else accentColor,
        radius = 12.dp.toPx(),
        center = center,
        style = Stroke(width = 2.dp.toPx())
    )
    drawCircle(
        color = NeedlePivot,
        radius = 5.dp.toPx(),
        center = center
    )
}

@Composable
private fun CenterReadout(
    fluxDensity: Float,
    peakFluxDensity: Float,
    threshold: Float,
    statusLevel: StatusLevel,
    isMetalDetected: Boolean,
    accentColor: Color,
    alertPulseAlpha: Float
) {
    Column(
        modifier = Modifier
            .padding(top = 110.dp)
            .fillMaxWidth(0.68f),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Large Precision Numeric Readout
        Row(
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = String.format(Locale.US, "%.1f", fluxDensity),
                fontSize = 44.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = if (isMetalDetected) AlertRed else TextPrimary,
                modifier = Modifier.testTag("numeric_flux_readout"),
                letterSpacing = (-1).sp
            )
            Spacer(modifier = Modifier.size(4.dp))
            Text(
                text = "µT",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = if (isMetalDetected) AlertRed.copy(alpha = alertPulseAlpha) else accentColor,
                modifier = Modifier.padding(bottom = 6.dp)
            )
        }

        Spacer(modifier = Modifier.height(2.dp))

        // Dynamic Status Pill
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(
                    if (isMetalDetected) AlertRed.copy(alpha = 0.25f)
                    else DarkSurfaceVariant
                )
                .border(
                    width = 1.dp,
                    color = if (isMetalDetected) AlertRed else accentColor.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(20.dp)
                )
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = when (statusLevel) {
                        StatusLevel.METAL_DETECTED -> Icons.Default.Warning
                        StatusLevel.ELEVATED_FIELD -> Icons.Rounded.ElectricBolt
                        StatusLevel.NORMAL_BACKGROUND -> Icons.Rounded.CheckCircle
                    },
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(13.dp)
                )
                Text(
                    text = when (statusLevel) {
                        StatusLevel.METAL_DETECTED -> "METAL DETECTED!"
                        StatusLevel.ELEVATED_FIELD -> "ELEVATED FIELD"
                        StatusLevel.NORMAL_BACKGROUND -> "NORMAL BACKGROUND"
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (isMetalDetected) AlertRed else TextPrimary,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Peak and Threshold Reference
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "PEAK: ${String.format(Locale.US, "%.1f", peakFluxDensity)}",
                fontSize = 10.sp,
                color = TextTertiary,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = "TRIG: ${threshold.toInt()} µT",
                fontSize = 10.sp,
                color = if (isMetalDetected) AlertRed else TextTertiary,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
