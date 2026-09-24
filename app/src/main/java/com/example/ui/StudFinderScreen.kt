package com.example.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Sensors
import androidx.compose.material.icons.rounded.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.CircularDialGauge
import com.example.ui.components.QuickControls
import com.example.ui.components.ScanWaveformCard
import com.example.ui.components.SensitivityDialog
import com.example.ui.components.SignalStrengthBar
import com.example.ui.components.VectorAxesCard
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
import com.example.viewmodel.StatusLevel
import com.example.viewmodel.StudFinderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudFinderScreen(
    viewModel: StudFinderViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Lifecycle Management: unregister when paused or backgrounded
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> viewModel.onAppResume()
                Lifecycle.Event.ON_PAUSE -> viewModel.onAppPause()
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            viewModel.onAppPause()
        }
    }

    var showSensitivityDialog by remember { mutableStateOf(false) }

    // Dynamic background accent color
    val animatedBgAccent by animateColorAsState(
        targetValue = when {
            state.isMetalDetected -> AlertRed.copy(alpha = 0.18f)
            state.statusLevel == StatusLevel.ELEVATED_FIELD -> ElevatedAmber.copy(alpha = 0.08f)
            else -> DarkBackground
        },
        animationSpec = tween(300),
        label = "bg_accent"
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (state.isMetalDetected) AlertRed
                                        else if (state.statusLevel == StatusLevel.ELEVATED_FIELD) ElevatedAmber
                                        else NormalGreen
                                    )
                            )
                            Text(
                                text = "STUD FINDER",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 2.sp,
                                fontFamily = FontFamily.Monospace,
                                color = if (state.isMetalDetected) AlertRed else TextPrimary
                            )
                        }
                        Text(
                            text = if (state.isSimulating) "DEMO SIMULATION ACTIVE" else "INTERNAL MAGNETOMETER UTILITY",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (state.isSimulating) ElectricCyan else TextTertiary,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = DarkSurface
                ),
                modifier = Modifier
                    .testTag("app_top_bar")
                    .border(
                        width = 1.dp,
                        color = if (state.isMetalDetected) AlertRed.copy(alpha = 0.5f) else DarkSurfaceBorder
                    )
            )
        },
        containerColor = DarkBackground,
        modifier = modifier
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            animatedBgAccent,
                            DarkBackground
                        )
                    )
                ),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .widthIn(max = 600.dp)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {

                // Status Banner / Metal Alert Header
                AlertStatusBanner(
                    isMetalDetected = state.isMetalDetected,
                    statusLevel = state.statusLevel,
                    statusMessage = state.statusMessage,
                    statusSubMessage = state.statusSubMessage,
                    fluxDensity = state.fluxDensity,
                    threshold = state.threshold
                )

                // 1. Core Requirement: Circular Dial Gauge in Center
                CircularDialGauge(
                    fluxDensity = state.fluxDensity,
                    threshold = state.threshold,
                    peakFluxDensity = state.peakFluxDensity,
                    statusLevel = state.statusLevel,
                    isMetalDetected = state.isMetalDetected,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )

                // 2. Proximity Signal Strength LED Bar
                SignalStrengthBar(
                    fluxDensity = state.fluxDensity,
                    threshold = state.threshold,
                    isMetalDetected = state.isMetalDetected
                )

                // 3. Quick Controls (Sound, Vibration, Threshold, Peak Reset, Demo Mode)
                QuickControls(
                    soundEnabled = state.soundEnabled,
                    vibrationEnabled = state.vibrationEnabled,
                    threshold = state.threshold,
                    isSimulating = state.isSimulating,
                    simulationPosition = state.simulationPosition,
                    isHardwareSensorAvailable = state.isHardwareSensorAvailable,
                    onToggleSound = { viewModel.toggleSound() },
                    onToggleVibration = { viewModel.toggleVibration() },
                    onOpenThresholdSettings = { showSensitivityDialog = true },
                    onResetPeak = { viewModel.resetPeak() },
                    onToggleSimulation = { viewModel.toggleSimulation() },
                    onSimulationPositionChange = { viewModel.setSimulationPosition(it) }
                )

                // 4. Real-time Scan Waveform
                ScanWaveformCard(
                    history = state.history,
                    threshold = state.threshold,
                    isMetalDetected = state.isMetalDetected
                )

                // 5. Triaxial Vectors Breakdown (Bx, By, Bz and formula sqrt(x^2+y^2+z^2))
                VectorAxesCard(
                    x = state.x,
                    y = state.y,
                    z = state.z
                )

                // 6. User Instructions Guide Card
                InstructionGuideCard()

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }

    if (showSensitivityDialog) {
        SensitivityDialog(
            currentThreshold = state.threshold,
            onDismiss = { showSensitivityDialog = false },
            onConfirm = {
                viewModel.updateThreshold(it)
                showSensitivityDialog = false
            },
            onResetDefault = {
                viewModel.resetThresholdToDefault()
                showSensitivityDialog = false
            }
        )
    }
}

@Composable
private fun AlertStatusBanner(
    isMetalDetected: Boolean,
    statusLevel: StatusLevel,
    statusMessage: String,
    statusSubMessage: String,
    fluxDensity: Float,
    threshold: Float
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("status_banner"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isMetalDetected) AlertRed.copy(alpha = 0.22f) else DarkSurface
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = if (isMetalDetected) 1.5.dp else 1.dp,
            color = if (isMetalDetected) AlertRed
                    else if (statusLevel == StatusLevel.ELEVATED_FIELD) ElevatedAmber
                    else DarkSurfaceBorder
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(
                        if (isMetalDetected) AlertRed
                        else if (statusLevel == StatusLevel.ELEVATED_FIELD) ElevatedAmber
                        else NormalGreen
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when {
                        isMetalDetected -> Icons.Rounded.Warning
                        statusLevel == StatusLevel.ELEVATED_FIELD -> Icons.Rounded.Sensors
                        else -> Icons.Rounded.CheckCircle
                    },
                    contentDescription = null,
                    tint = DarkBackground,
                    modifier = Modifier.size(20.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = statusMessage,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 0.5.sp,
                    color = if (isMetalDetected) AlertRed else TextPrimary
                )
                Text(
                    text = statusSubMessage,
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }

            // Quick delta badge
            val delta = fluxDensity - threshold
            if (isMetalDetected) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(AlertRed)
                        .padding(horizontal = 6.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "+${delta.toInt()} µT",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = DarkBackground,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}

@Composable
private fun InstructionGuideCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkSurfaceBorder)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Rounded.Info,
                    contentDescription = null,
                    tint = ElectricCyan,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "HOW TO SCAN FOR WALL STUDS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    letterSpacing = 0.5.sp
                )
            }

            Text(
                text = "1. Place device flat against drywall at a neutral wall location.\n" +
                       "2. Observe ambient baseline (typically 40–50 µT).\n" +
                       "3. Slide the phone horizontally across the surface slowly.\n" +
                       "4. Watch the dial rise: drywall screws, nails, and steel studs will cause flux density to spike past 70 µT, triggering audio and vibration alerts.",
                fontSize = 11.sp,
                color = TextSecondary,
                lineHeight = 16.sp
            )
        }
    }
}
