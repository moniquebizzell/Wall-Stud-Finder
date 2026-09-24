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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.GraphicEq
import androidx.compose.material.icons.rounded.RestartAlt
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material.icons.rounded.Vibration
import androidx.compose.material.icons.rounded.VolumeOff
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
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
fun QuickControls(
    soundEnabled: Boolean,
    vibrationEnabled: Boolean,
    threshold: Float,
    isSimulating: Boolean,
    simulationPosition: Float,
    isHardwareSensorAvailable: Boolean,
    onToggleSound: () -> Unit,
    onToggleVibration: () -> Unit,
    onOpenThresholdSettings: () -> Unit,
    onResetPeak: () -> Unit,
    onToggleSimulation: () -> Unit,
    onSimulationPositionChange: (Float) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .testTag("quick_controls")
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(1.dp, DarkSurfaceBorder, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        // Top Row: Primary action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Sound Alert Toggle
            ControlButton(
                icon = if (soundEnabled) Icons.Rounded.VolumeUp else Icons.Rounded.VolumeOff,
                label = if (soundEnabled) "AUDIO ON" else "MUTED",
                isActive = soundEnabled,
                activeColor = ElectricCyan,
                testTag = "sound_toggle_button",
                onClick = onToggleSound,
                modifier = Modifier.weight(1f)
            )

            // Vibration Alert Toggle
            ControlButton(
                icon = Icons.Rounded.Vibration,
                label = if (vibrationEnabled) "HAPTIC ON" else "HAPTIC OFF",
                isActive = vibrationEnabled,
                activeColor = NormalGreen,
                testTag = "vibration_toggle_button",
                onClick = onToggleVibration,
                modifier = Modifier.weight(1f)
            )

            // Threshold Adjuster
            ControlButton(
                icon = Icons.Rounded.Tune,
                label = "${threshold.toInt()} µT",
                isActive = true,
                activeColor = ElevatedAmber,
                testTag = "threshold_settings_button",
                onClick = onOpenThresholdSettings,
                modifier = Modifier.weight(1f)
            )

            // Reset Peak Button
            ControlButton(
                icon = Icons.Rounded.RestartAlt,
                label = "RESET PEAK",
                isActive = false,
                activeColor = TextSecondary,
                testTag = "reset_peak_button",
                onClick = onResetPeak,
                modifier = Modifier.weight(1f)
            )
        }

        // Demo / Simulation Mode Bar (especially helpful for testing or in emulators)
        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(DarkSurfaceVariant)
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Rounded.GraphicEq,
                    contentDescription = null,
                    tint = if (isSimulating) ElectricCyan else TextTertiary,
                    modifier = Modifier.size(16.dp)
                )
                Column {
                    Text(
                        text = if (isSimulating) "SIMULATION ACTIVE" else "HARDWARE SENSOR",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSimulating) ElectricCyan else TextSecondary
                    )
                    Text(
                        text = if (!isHardwareSensorAvailable) "No physical magnetometer; demo mode active"
                               else if (isSimulating) "Simulating drywall wall scan"
                               else "Magnetometer (Sensor.TYPE_MAGNETIC_FIELD)",
                        fontSize = 9.sp,
                        color = TextTertiary
                    )
                }
            }

            OutlinedButton(
                onClick = onToggleSimulation,
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = if (isSimulating) AlertRed else ElectricCyan
                ),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                modifier = Modifier
                    .height(30.dp)
                    .testTag("toggle_simulation_button")
            ) {
                Text(
                    text = if (isSimulating) "STOP DEMO" else "DEMO MODE",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // If in simulation mode, provide interactive sweep slider
        if (isSimulating) {
            Spacer(modifier = Modifier.height(8.dp))
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "MANUAL WALL SWEEP (STUD AT 50%)",
                        fontSize = 9.sp,
                        color = ElectricCyan,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "${(simulationPosition * 100).toInt()}%",
                        fontSize = 9.sp,
                        color = TextPrimary,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Slider(
                    value = simulationPosition,
                    onValueChange = onSimulationPositionChange,
                    colors = SliderDefaults.colors(
                        thumbColor = ElectricCyan,
                        activeTrackColor = ElectricCyan,
                        inactiveTrackColor = DarkSurfaceBorder
                    ),
                    modifier = Modifier.testTag("simulation_slider")
                )
            }
        }
    }
}

@Composable
private fun ControlButton(
    icon: ImageVector,
    label: String,
    isActive: Boolean,
    activeColor: Color,
    testTag: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ElevatedButton(
        onClick = onClick,
        modifier = modifier
            .testTag(testTag)
            .height(58.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.elevatedButtonColors(
            containerColor = if (isActive) DarkSurfaceVariant else DarkSurface,
            contentColor = if (isActive) activeColor else TextSecondary
        ),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(4.dp),
        elevation = ButtonDefaults.elevatedButtonElevation(defaultElevation = 2.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isActive) activeColor else TextSecondary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = if (isActive) activeColor else TextSecondary
            )
        }
    }
}
