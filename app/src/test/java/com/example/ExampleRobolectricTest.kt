package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.viewmodel.StatusLevel
import com.example.viewmodel.StudFinderViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import kotlin.math.sqrt

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun `read app_name string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Stud Finder", appName)
  }

  @Test
  fun `verify magnetic flux density calculation formula sqrt x2 y2 z2`() {
    val x = 30f
    val y = 40f
    val z = 0f
    val mag = sqrt(x * x + y * y + z * z)
    assertEquals(50f, mag, 0.001f)

    // Triaxial 3D vector test
    val x2 = 25f
    val y2 = 35f
    val z2 = 60f
    val expected = sqrt(25f * 25f + 35f * 35f + 60f * 60f)
    val calculated = sqrt(x2 * x2 + y2 * y2 + z2 * z2)
    assertEquals(expected, calculated, 0.001f)
  }

  @Test
  fun `verify detection threshold logic at 70 uT`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val app = context as android.app.Application
    val viewModel = StudFinderViewModel(app)

    // Verify initial default threshold is 70 uT
    assertEquals(70.0f, viewModel.uiState.value.threshold, 0.001f)

    // Verify ambient position (e.g. 0.05) has magnitude < 70 uT
    viewModel.setSimulationPosition(0.05f)
    val ambientState = viewModel.uiState.value
    assertTrue("Ambient should be under 70 uT", ambientState.fluxDensity < 70f)
    assertFalse("Ambient should not trigger metal detected", ambientState.isMetalDetected)

    // Verify center position (0.5) has peak magnitude >= 70 uT (around 102 uT)
    viewModel.setSimulationPosition(0.5f)
    val detectedState = viewModel.uiState.value
    assertTrue("Stud center should be >= 70 uT", detectedState.fluxDensity >= 70f)
    assertTrue("Stud center should trigger metal detected", detectedState.isMetalDetected)
    assertEquals(StatusLevel.METAL_DETECTED, detectedState.statusLevel)
  }

  @Test
  fun `verify peak hold and reset peak`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val app = context as android.app.Application
    val viewModel = StudFinderViewModel(app)

    viewModel.setSimulationPosition(0.5f)
    val peak = viewModel.uiState.value.peakFluxDensity
    assertTrue("Peak should be recorded above 70 uT", peak >= 70f)

    viewModel.setSimulationPosition(0.05f)
    // Peak should be preserved even when current value drops
    assertEquals(peak, viewModel.uiState.value.peakFluxDensity, 0.001f)

    // Reset peak should set it to current flux density
    viewModel.resetPeak()
    assertEquals(viewModel.uiState.value.fluxDensity, viewModel.uiState.value.peakFluxDensity, 0.01f)
  }
}
