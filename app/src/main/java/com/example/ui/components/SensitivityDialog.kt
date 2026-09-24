package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AlertRed
import com.example.ui.theme.DarkBackground
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
fun SensitivityDialog(
    currentThreshold: Float,
    onDismiss: () -> Unit,
    onConfirm: (Float) -> Unit,
    onResetDefault: () -> Unit
) {
    var sliderValue by remember { mutableFloatStateOf(currentThreshold) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        titleContentColor = TextPrimary,
        textContentColor = TextSecondary,
        shape = RoundedCornerShape(16.dp),
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "DETECTION THRESHOLD",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = TextPrimary
                )
                Text(
                    text = "${sliderValue.toInt()} µT",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    color = AlertRed
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Typical ambient geomagnetic field is 40–50 µT. The recommended standard threshold for drywall wall studs and metal fasteners is 70 µT.",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    lineHeight = 17.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Slider
                Slider(
                    value = sliderValue,
                    onValueChange = { sliderValue = it },
                    valueRange = 55f..120f,
                    steps = 12,
                    colors = SliderDefaults.colors(
                        thumbColor = AlertRed,
                        activeTrackColor = AlertRed,
                        inactiveTrackColor = DarkSurfaceBorder
                    ),
                    modifier = Modifier.testTag("threshold_slider")
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("55 µT (High Sens.)", fontSize = 10.sp, color = TextTertiary, fontFamily = FontFamily.Monospace)
                    Text("70 µT (Standard)", fontSize = 10.sp, color = NormalGreen, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                    Text("120 µT (Deep Steel)", fontSize = 10.sp, color = TextTertiary, fontFamily = FontFamily.Monospace)
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Presets
                Text(
                    text = "QUICK PRESETS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextTertiary,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    PresetButton(label = "60 µT", subtitle = "Light Fastener") { sliderValue = 60f }
                    PresetButton(label = "70 µT ★", subtitle = "Default Stud") { sliderValue = 70f }
                    PresetButton(label = "85 µT", subtitle = "Rebar / Pipe") { sliderValue = 85f }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(sliderValue) },
                colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = DarkBackground),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.testTag("confirm_threshold_button")
            ) {
                Text("APPLY", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_threshold_button")
            ) {
                Text("CANCEL", color = TextSecondary)
            }
        }
    )
}

@Composable
private fun PresetButton(
    label: String,
    subtitle: String,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = Modifier.height(44.dp),
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
            Text(subtitle, fontSize = 8.sp, color = TextTertiary)
        }
    }
}
