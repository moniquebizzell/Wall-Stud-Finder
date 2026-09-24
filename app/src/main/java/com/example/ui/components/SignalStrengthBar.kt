package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AlertRed
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceBorder
import com.example.ui.theme.DarkSurfaceVariant
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.ElevatedAmber
import com.example.ui.theme.NormalGreen
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary

@Composable
fun SignalStrengthBar(
    fluxDensity: Float,
    threshold: Float,
    isMetalDetected: Boolean,
    modifier: Modifier = Modifier
) {
    val totalSegments = 12
    // Map 30 µT (ambient minimum) to 110 µT (heavy metallic proximity)
    val normalizedFraction = ((fluxDensity - 30f) / 80f).coerceIn(0f, 1f)
    val activeSegments = (normalizedFraction * totalSegments).toInt().coerceIn(0, totalSegments)

    Column(
        modifier = modifier
            .testTag("signal_strength_bar")
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(
                width = 1.dp,
                color = if (isMetalDetected) AlertRed.copy(alpha = 0.6f) else DarkSurfaceBorder,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "PROXIMITY RADAR",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
            Text(
                text = if (isMetalDetected) "STUD CENTER ALIGNED" else if (fluxDensity >= 52f) "SIGNAL RISING" else "IDLE / SCANNING",
                fontSize = 10.sp,
                fontWeight = FontWeight.ExtraBold,
                fontFamily = FontFamily.Monospace,
                color = if (isMetalDetected) AlertRed else if (fluxDensity >= 52f) ElevatedAmber else NormalGreen
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Multi-segment LED bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            for (index in 0 until totalSegments) {
                val isActive = index < activeSegments
                val segmentFraction = index.toFloat() / totalSegments

                val segmentColor = when {
                    segmentFraction >= 0.60f -> AlertRed
                    segmentFraction >= 0.35f -> ElevatedAmber
                    else -> NormalGreen
                }

                val animatedColor by animateColorAsState(
                    targetValue = if (isActive) segmentColor else DarkSurfaceVariant,
                    animationSpec = tween(120),
                    label = "led_seg_$index"
                )

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(18.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(animatedColor)
                        .border(
                            width = 0.5.dp,
                            color = if (isActive) Color.White.copy(alpha = 0.3f) else Color.Transparent,
                            shape = RoundedCornerShape(3.dp)
                        )
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "30 µT",
                fontSize = 9.sp,
                color = TextTertiary,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "THRESHOLD (70 µT)",
                fontSize = 9.sp,
                color = if (isMetalDetected) AlertRed else TextTertiary,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "110+ µT",
                fontSize = 9.sp,
                color = TextTertiary,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}
