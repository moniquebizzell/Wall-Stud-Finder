package com.example.ui.components

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
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
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary

@Composable
fun ScanWaveformCard(
    history: List<Float>,
    threshold: Float,
    isMetalDetected: Boolean,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .testTag("scan_waveform_card")
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(
                1.dp,
                if (isMetalDetected) AlertRed.copy(alpha = 0.5f) else DarkSurfaceBorder,
                RoundedCornerShape(12.dp)
            )
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "REAL-TIME SCAN WAVEFORM",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
            Text(
                text = "WALL PROFILE",
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isMetalDetected) AlertRed else ElectricCyan,
                fontFamily = FontFamily.Monospace
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Canvas Waveform Scope
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(DarkSurfaceVariant)
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
                    .padding(vertical = 4.dp)
            ) {
                val w = size.width
                val h = size.height

                // Grid lines (30 uT, 50 uT, 70 uT threshold, 100 uT)
                val minScale = 25f
                val maxScale = 120f

                fun yForVal(v: Float): Float {
                    val fraction = ((v - minScale) / (maxScale - minScale)).coerceIn(0f, 1f)
                    return h - (fraction * h)
                }

                // Draw Threshold reference line
                val threshY = yForVal(threshold)
                drawLine(
                    color = AlertRed.copy(alpha = 0.5f),
                    start = Offset(0f, threshY),
                    end = Offset(w, threshY),
                    strokeWidth = 1.dp.toPx()
                )

                // Ambient baseline line (45 uT)
                val ambientY = yForVal(45f)
                drawLine(
                    color = DarkSurfaceBorder,
                    start = Offset(0f, ambientY),
                    end = Offset(w, ambientY),
                    strokeWidth = 0.8.dp.toPx()
                )

                // Plot waveform history
                if (history.size >= 2) {
                    val path = Path()
                    val stepX = w / (history.size - 1).coerceAtLeast(1)

                    history.forEachIndexed { i, valPoint ->
                        val x = i * stepX
                        val y = yForVal(valPoint)
                        if (i == 0) {
                            path.moveTo(x, y)
                        } else {
                            path.lineTo(x, y)
                        }
                    }

                    drawPath(
                        path = path,
                        color = if (isMetalDetected) AlertRed else ElectricCyan,
                        style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                    )

                    // Draw dot at latest point
                    val lastX = (history.size - 1) * stepX
                    val lastY = yForVal(history.last())
                    drawCircle(
                        color = if (isMetalDetected) AlertRed else Color.White,
                        radius = 3.5.dp.toPx(),
                        center = Offset(lastX, lastY)
                    )
                }
            }
        }
    }
}
