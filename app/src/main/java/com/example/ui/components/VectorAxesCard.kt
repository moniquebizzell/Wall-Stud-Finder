package com.example.ui.components

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceBorder
import com.example.ui.theme.DarkSurfaceVariant
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.ElevatedAmber
import com.example.ui.theme.NormalGreen
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary
import java.util.Locale

@Composable
fun VectorAxesCard(
    x: Float,
    y: Float,
    z: Float,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .testTag("vector_axes_card")
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(1.dp, DarkSurfaceBorder, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "TRIAXIAL FLUX VECTORS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
            // Mathematical formula badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(DarkSurfaceVariant)
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "B = √(X² + Y² + Z²)",
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = ElectricCyan
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            AxisColumn(
                axisLabel = "X-AXIS",
                value = x,
                accentColor = ElectricCyan,
                modifier = Modifier.weight(1f)
            )
            AxisColumn(
                axisLabel = "Y-AXIS",
                value = y,
                accentColor = NormalGreen,
                modifier = Modifier.weight(1f)
            )
            AxisColumn(
                axisLabel = "Z-AXIS",
                value = z,
                accentColor = ElevatedAmber,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun AxisColumn(
    axisLabel: String,
    value: Float,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(DarkSurfaceVariant)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = axisLabel,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = TextTertiary,
            fontFamily = FontFamily.Monospace
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = String.format(Locale.US, "%+.1f", value),
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            fontFamily = FontFamily.Monospace
        )
        Text(
            text = "µT",
            fontSize = 9.sp,
            color = accentColor,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(4.dp))

        // Center-zero deviation bar
        val maxVal = 60f
        val normalized = (value / maxVal).coerceIn(-1f, 1f)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(DarkSurface)
        ) {
            // Draw bar from center (50%) to left or right
            if (normalized >= 0) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.5f + (normalized * 0.5f))
                        .padding(start = 18.dp)
                        .height(4.dp)
                        .background(accentColor)
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .padding(end = (kotlin.math.abs(normalized) * 18).dp)
                        .height(4.dp)
                        .background(accentColor)
                )
            }
        }
    }
}
