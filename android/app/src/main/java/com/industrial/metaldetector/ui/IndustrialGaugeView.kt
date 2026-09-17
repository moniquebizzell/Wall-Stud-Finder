package com.industrial.metaldetector.ui

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import kotlin.math.cos
import kotlin.math.sin

/**
 * Custom Android View for drawing the industrial dial gauge using hardware-accelerated Canvas.
 */
class IndustrialGaugeView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var currentFlux: Float = 45.0f
        set(value) {
            field = value.coerceIn(0f, 200f)
            postInvalidateOnAnimation()
        }

    var threshold: Float = 70.0f
        set(value) {
            field = value
            postInvalidateOnAnimation()
        }

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#15171D")
        style = Paint.Style.FILL
    }

    private val bezelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#252830")
        style = Paint.Style.STROKE
        strokeWidth = 24f
    }

    private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#2A2D35")
        style = Paint.Style.STROKE
        strokeWidth = 8f
        strokeCap = Paint.Cap.ROUND
    }

    private val ambientPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#00FF41")
        style = Paint.Style.STROKE
        strokeWidth = 14f
    }

    private val dangerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FF3E3E")
        style = Paint.Style.STROKE
        strokeWidth = 14f
        strokeCap = Paint.Cap.ROUND
    }

    private val needlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#E0E0E0")
        style = Paint.Style.FILL_AND_STROKE
        strokeWidth = 6f
        strokeCap = Paint.Cap.ROUND
    }

    private val needleTipPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FF3E3E")
        style = Paint.Style.STROKE
        strokeWidth = 6f
        strokeCap = Paint.Cap.ROUND
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FFFFFF")
        textAlign = Paint.Align.CENTER
        typeface = Typeface.MONOSPACE
        textSize = 68f
        isFakeBoldText = true
    }

    private val unitPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FF3E3E")
        textAlign = Paint.Align.LEFT
        typeface = Typeface.MONOSPACE
        textSize = 28f
        isFakeBoldText = true
    }

    private val arcBounds = RectF()

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val cx = width / 2f
        val cy = height / 2f
        val radius = (Math.min(width, height) / 2f) - 36f

        // Draw chassis and bezel
        canvas.drawCircle(cx, cy, radius + 20f, bgPaint)
        bezelPaint.color = if (currentFlux >= threshold) Color.parseColor("#FF3E3E") else Color.parseColor("#252830")
        canvas.drawCircle(cx, cy, radius + 20f, bezelPaint)

        // Draw Scale Arcs: 135 deg to 405 deg (270 degree sweep)
        arcBounds.set(cx - radius, cy - radius, cx + radius, cy + radius)
        canvas.drawArc(arcBounds, 135f, 270f, false, trackPaint)

        // Normal zone: 40-50 µT
        val ambientStart = 135f + (40f / 200f) * 270f
        val ambientSweep = (10f / 200f) * 270f
        canvas.drawArc(arcBounds, ambientStart, ambientSweep, false, ambientPaint)

        // Danger zone: 70-200 µT
        val dangerStart = 135f + (threshold / 200f) * 270f
        val dangerSweep = ((200f - threshold) / 200f) * 270f
        canvas.drawArc(arcBounds, dangerStart, dangerSweep, false, dangerPaint)

        // Draw Rotating Needle
        val angleDeg = -135f + (currentFlux / 200f) * 270f
        val angleRad = Math.toRadians((angleDeg - 90).toDouble())

        val needleEndX = (cx + (radius - 10f) * cos(angleRad)).toFloat()
        val needleEndY = (cy + (radius - 10f) * sin(angleRad)).toFloat()

        needlePaint.color = if (currentFlux >= threshold) Color.parseColor("#FF3E3E") else Color.parseColor("#FFFFFF")
        canvas.drawLine(cx, cy, needleEndX, needleEndY, needlePaint)

        // Tip highlight
        val tipStartX = (cx + (radius - 35f) * cos(angleRad)).toFloat()
        val tipStartY = (cy + (radius - 35f) * sin(angleRad)).toFloat()
        canvas.drawLine(tipStartX, tipStartY, needleEndX, needleEndY, needleTipPaint)

        // Center needle hub
        canvas.drawCircle(cx, cy, 26f, trackPaint)
        canvas.drawCircle(cx, cy, 12f, needleTipPaint)

        // Digital Flux text
        textPaint.color = if (currentFlux >= threshold) Color.parseColor("#FF3E3E") else Color.parseColor("#FFFFFF")
        val fluxStr = String.format("%.1f", currentFlux)
        canvas.drawText(fluxStr, cx - 15f, cy + 90f, textPaint)
        canvas.drawText("µT", cx + 75f, cy + 85f, unitPaint)
    }
}
