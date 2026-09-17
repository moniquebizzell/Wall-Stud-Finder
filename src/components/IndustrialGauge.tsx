import React, { useMemo } from 'react';

interface IndustrialGaugeProps {
  value: number;
  threshold?: number;
  isAlert: boolean;
  max?: number;
  size?: number;
  label?: string;
  unit?: string;
  isStudMode?: boolean;
}

export const IndustrialGauge: React.FC<IndustrialGaugeProps> = ({
  value,
  threshold = 70,
  isAlert,
  max = 200,
  size = 360,
  label = 'MAGNETIC FLUX DENSITY',
  unit = 'µT',
  isStudMode = false,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max);

  // Gauge angles: 135° (bottom left) to 405° (bottom right), total 270° span
  const startAngle = 135;
  const totalAngle = 270;
  const needleAngle = startAngle + (clampedValue / max) * totalAngle;
  const thresholdAngle = startAngle + (threshold / max) * totalAngle;

  const center = size / 2;
  const radius = size * 0.38;
  const innerRadius = radius - 36;

  // Geometry helper for polar to cartesian coordinates
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  // SVG arc path generator
  const describeArc = (
    x: number,
    y: number,
    r: number,
    startAng: number,
    endAng: number
  ) => {
    const start = polarToCartesian(x, y, r, endAng);
    const end = polarToCartesian(x, y, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  // Ticks generation (major ticks every 20 µT, minor every 5 µT)
  const ticks = useMemo(() => {
    const tickList: Array<{
      val: number;
      isMajor: boolean;
      isThreshold: boolean;
      isAmbientZone: boolean;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      textX: number;
      textY: number;
      angle: number;
    }> = [];

    const step = 5;
    for (let v = 0; v <= max; v += step) {
      const angle = startAngle + (v / max) * totalAngle;
      const isMajor = v % 20 === 0;
      const isThreshold = v === threshold;
      const isAmbientZone = v >= 40 && v <= 50;

      const outerR = radius;
      const tickLength = isMajor ? 18 : (isThreshold ? 22 : 10);
      const innerR = radius - tickLength;

      const p1 = polarToCartesian(center, center, innerR, angle);
      const p2 = polarToCartesian(center, center, outerR, angle);
      const pText = polarToCartesian(center, center, radius - 32, angle);

      tickList.push({
        val: v,
        isMajor,
        isThreshold,
        isAmbientZone,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        textX: pText.x,
        textY: pText.y,
        angle,
      });
    }
    return tickList;
  }, [max, threshold, totalAngle, startAngle, radius, center]);

  // Hex bolts around bezel (8 industrial bolts)
  const bolts = useMemo(() => {
    const boltList = [];
    const boltRadius = (size / 2) - 13;
    for (let i = 0; i < 8; i++) {
      const angle = i * 45;
      const p = polarToCartesian(center, center, boltRadius, angle);
      boltList.push({ x: p.x, y: p.y, angle });
    }
    return boltList;
  }, [center, size]);

  // Threshold marker line coordinates
  const threshP1 = polarToCartesian(center, center, radius - 24, thresholdAngle);
  const threshP2 = polarToCartesian(center, center, radius + 4, thresholdAngle);

  // Normal background zone coordinates (40-50 µT)
  const ambientStartAngle = startAngle + (40 / max) * totalAngle;
  const ambientEndAngle = startAngle + (50 / max) * totalAngle;

  // Arc paths
  const baseArcPath = describeArc(center, center, radius, startAngle, startAngle + totalAngle);
  const ambientArcPath = describeArc(center, center, radius, ambientStartAngle, ambientEndAngle);
  const dangerArcPath = describeArc(center, center, radius, thresholdAngle, startAngle + totalAngle);
  const activeValArcPath = describeArc(
    center,
    center,
    radius - 4,
    startAngle,
    Math.min(startAngle + totalAngle, needleAngle)
  );

  return (
    <div
      id="industrial-gauge-container"
      className="relative flex flex-col items-center justify-center select-none"
    >
      {/* Outer Enclosure matching Recipe 3: border-8 border-[#252830] bg-[#15171D] */}
      <div
        className={`relative rounded-full transition-all duration-300 ${
          isAlert
            ? 'shadow-[0_0_80px_rgba(255,62,62,0.35)] border-8 border-[#FF3E3E] bg-[#1A0C0E]'
            : 'shadow-[0_0_80px_rgba(0,0,0,0.6)] border-8 border-[#252830] bg-[#15171D]'
        }`}
        style={{ width: size, height: size }}
      >
        {/* Inner concentric dashed ring from Recipe 3 */}
        <div className={`absolute inset-3 rounded-full border-2 border-dashed pointer-events-none transition-colors ${
          isAlert ? 'border-[#FF3E3E]/40' : 'border-[#3A3E4A]'
        }`} />

        <svg
          id="industrial-dial-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Bezel Metallic Gradients */}
            <radialGradient id="bezelOuter" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#2A2D35" />
              <stop offset="60%" stopColor="#1E2026" />
              <stop offset="100%" stopColor="#15171D" />
            </radialGradient>

            <linearGradient id="bezelRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A3E4A" />
              <stop offset="50%" stopColor="#252830" />
              <stop offset="100%" stopColor="#3A3E4A" />
            </linearGradient>

            {/* Dial Face Background Gradient matching #15171D */}
            <radialGradient id="dialFace" cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                stopColor={isAlert ? '#250B0D' : '#15171D'}
              />
              <stop
                offset="75%"
                stopColor={isAlert ? '#190607' : '#0F1115'}
              />
              <stop
                offset="100%"
                stopColor={isAlert ? '#280D0F' : '#0A0B0E'}
              />
            </radialGradient>

            {/* Needle Gradient: Crisp silver or #FF3E3E */}
            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor={isAlert ? '#FF6B6B' : '#FFFFFF'}
              />
              <stop
                offset="50%"
                stopColor={isAlert ? '#FF3E3E' : '#E0E0E0'}
              />
              <stop
                offset="100%"
                stopColor={isAlert ? '#CC2020' : '#8A8E9A'}
              />
            </linearGradient>

            {/* Glow Filter for Alert Mode */}
            <filter id="alertGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle Industrial Grid Pattern */}
            <pattern id="gaugeTexture" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="0.6" fill={isAlert ? '#FF3E3E' : '#2A2D35'} opacity="0.4" />
            </pattern>
          </defs>

          {/* 1. Dial Face Canvas */}
          <circle
            cx={center}
            cy={center}
            r={(size / 2) - 20}
            fill="url(#dialFace)"
            stroke={isAlert ? '#FF3E3E' : '#2A2D35'}
            strokeWidth="1.5"
          />
          <circle
            cx={center}
            cy={center}
            r={(size / 2) - 20}
            fill="url(#gaugeTexture)"
          />

          {/* Concentric Measurement Rings */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isAlert ? '#FF3E3E' : '#2A2D35'}
            strokeWidth="1.5"
            strokeDasharray="2,3"
          />
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke={isAlert ? '#FF3E3E' : '#1F222A'}
            strokeWidth="1"
            opacity="0.6"
          />

          {/* 3. Scale Arcs */}
          {/* Base Inactive Track with Recipe 3 stroke '#2A2D35' */}
          <path
            d={baseArcPath}
            fill="none"
            stroke={isAlert ? '#3A1417' : '#2A2D35'}
            strokeWidth="4"
            strokeDasharray="1, 3"
          />

          {/* Normal Background Magnetism Zone (40-50 µT) phosphor green */}
          <path
            d={ambientArcPath}
            fill="none"
            stroke={isAlert ? '#4A4E5A' : '#00FF41'}
            strokeWidth="6"
            opacity={isAlert ? 0.4 : 0.85}
          />

          {/* Alert / Danger Zone Arc (70 - 200 µT) in #FF3E3E */}
          <path
            d={dangerArcPath}
            fill="none"
            stroke="#FF3E3E"
            strokeWidth="6"
            strokeLinecap="round"
            className={isAlert ? 'animate-pulse' : ''}
            filter={isAlert ? 'url(#alertGlow)' : undefined}
          />

          {/* Active Level Arc Tracking the Needle */}
          <path
            d={activeValArcPath}
            fill="none"
            stroke={isAlert ? '#FF3E3E' : '#E0E0E0'}
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
            filter={isAlert ? 'url(#alertGlow)' : undefined}
          />

          {/* 4. Ticks and Numerical Labels */}
          {ticks.map((t, idx) => {
            let strokeColor = '#3A3E4A';
            let strokeW = 1.5;

            if (t.isThreshold) {
              strokeColor = '#FF3E3E';
              strokeW = 3.5;
            } else if (t.isMajor) {
              if (t.val >= threshold) {
                strokeColor = isAlert ? '#FF6B6B' : '#FF3E3E';
              } else if (t.val >= 40 && t.val <= 50) {
                strokeColor = isAlert ? '#6A6E7A' : '#00FF41';
              } else {
                strokeColor = isAlert ? '#6A6E7A' : '#6A6E7A';
              }
              strokeW = 2.5;
            } else if (t.val >= threshold) {
              strokeColor = isAlert ? '#FF3E3E' : '#8A2020';
              strokeW = 2;
            } else if (t.isAmbientZone) {
              strokeColor = isAlert ? '#4A4E5A' : '#00FF41';
            }

            return (
              <g key={idx}>
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                />
                {t.isMajor && (
                  <text
                    x={t.textX}
                    y={t.textY}
                    fill={t.val >= threshold ? '#FF3E3E' : '#6A6E7A'}
                    fontSize="10"
                    fontFamily="'Share Tech Mono', monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {t.val}
                  </text>
                )}
              </g>
            );
          })}

          {/* 70 µT Threshold Callout Line */}
          <line
            x1={threshP1.x}
            y1={threshP1.y}
            x2={threshP2.x}
            y2={threshP2.y}
            stroke="#FF3E3E"
            strokeWidth="3.5"
          />

          {/* 5. Dial Center Badges and Markings */}
          <text
            x={center}
            y={center - 62}
            fill={isAlert ? '#FF3E3E' : '#6A6E7A'}
            fontSize="9"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="700"
            letterSpacing="2.5"
            textAnchor="middle"
          >
            {label}
          </text>

          {/* Ambient zone indicator marker label */}
          <text
            x={center - 64}
            y={center - 42}
            fill={isAlert ? '#4A4E5A' : '#00FF41'}
            fontSize="7.5"
            fontFamily="'Share Tech Mono', monospace"
            fontWeight="600"
            textAnchor="middle"
          >
            AMBIENT 40-50
          </text>

          {/* Threshold alert marker label */}
          <text
            x={center + 64}
            y={center - 42}
            fill="#FF3E3E"
            fontSize="7.5"
            fontFamily="'Share Tech Mono', monospace"
            fontWeight="700"
            textAnchor="middle"
          >
            LIMIT &gt;{threshold}µT
          </text>

          {/* 6. The Needle (Smoothly rotating) */}
          <g
            transform={`rotate(${needleAngle}, ${center}, ${center})`}
            filter={isAlert ? 'url(#alertGlow)' : undefined}
            className="transition-transform duration-75 ease-out"
          >
            {/* Needle shadow */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center - (radius + 2)}
              stroke="rgba(0,0,0,0.7)"
              strokeWidth="4"
              transform="translate(2, 3)"
            />

            {/* Counterweight Tail */}
            <polygon
              points={`
                ${center - 3.5},${center}
                ${center + 3.5},${center}
                ${center + 2.5},${center + 24}
                ${center - 2.5},${center + 24}
              `}
              fill={isAlert ? '#8B1A1A' : '#2A2D35'}
            />
            <circle
              cx={center}
              cy={center + 20}
              r="3"
              fill={isAlert ? '#FF3E3E' : '#3A3E4A'}
            />

            {/* Needle Blade */}
            <polygon
              points={`
                ${center - 2.5},${center}
                ${center + 2.5},${center}
                ${center + 0.6},${center - (radius + 2)}
                ${center - 0.6},${center - (radius + 2)}
              `}
              fill="url(#needleGradient)"
            />

            {/* Needle Tip Accent in #FF3E3E */}
            <line
              x1={center}
              y1={center - radius + 14}
              x2={center}
              y2={center - radius - 2}
              stroke={isAlert ? '#FFFFFF' : '#FF3E3E'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* 7. Center Needle Pivot Hub */}
          <circle
            cx={center}
            cy={center}
            r="15"
            fill={isAlert ? '#3A0F11' : '#1E2026'}
            stroke={isAlert ? '#FF3E3E' : '#2A2D35'}
            strokeWidth="2"
          />
          <circle
            cx={center}
            cy={center}
            r="8"
            fill={isAlert ? '#FF3E3E' : '#2A2D35'}
          />
          <circle
            cx={center}
            cy={center}
            r="3.5"
            fill={isAlert ? '#FFFFFF' : '#6A6E7A'}
          />

          {/* 8. Hex Bolts around Bezel */}
          {bolts.map((b, i) => (
            <g key={i} transform={`translate(${b.x}, ${b.y}) rotate(${b.angle + 30})`}>
              <circle
                cx="0"
                cy="0"
                r="5"
                fill="#2A2D35"
                stroke="#15171D"
                strokeWidth="1.5"
              />
              <polygon
                points="-2.2,-1.2 0,-2.5 2.2,-1.2 2.2,1.2 0,2.5 -2.2,1.2"
                fill="#0A0B0E"
              />
            </g>
          ))}
        </svg>

        {/* Center Readout matching Recipe 3 style: */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{ bottom: size * 0.16 }}
        >
          {/* Flux Density Label */}
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#6A6E7A] font-bold font-mono mb-0.5">
            Flux Density
          </div>

          {/* Real-time Numeric Value Display: text-5xl or 6xl text-[#FFFFFF], unit text-[#FF3E3E] */}
          <div className="flex items-baseline justify-center">
            <span
              id="gauge-digital-value"
              className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight transition-colors ${
                isAlert ? 'text-[#FF3E3E] drop-shadow-[0_0_18px_rgba(255,62,62,0.6)]' : 'text-[#FFFFFF]'
              }`}
            >
              {clampedValue.toFixed(1)}
            </span>
            <span
              className="text-base sm:text-lg text-[#FF3E3E] ml-1 font-mono font-bold opacity-90"
            >
              {unit}
            </span>
          </div>

          {/* Industrial Status Placard: exact dynamic descriptive status indicators */}
          <div className="mt-2">
            {isAlert ? (
              <div
                id="metal-detected-alert"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF3E3E]/15 border border-[#FF3E3E] text-[#FF3E3E] text-[10px] sm:text-[11px] uppercase tracking-widest font-mono rounded font-bold animate-pulse"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF3E3E] animate-ping" />
                {isStudMode ? 'STUD / METAL DETECTED!' : 'METAL DETECTED!'}
              </div>
            ) : clampedValue >= 40 && clampedValue <= 50 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF41]/10 border border-[#00FF41] text-[#00FF41] text-[10px] sm:text-[11px] uppercase tracking-widest font-mono rounded font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                NORMAL BACKGROUND
              </div>
            ) : clampedValue > 50 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFA500]/15 border border-[#FFA500] text-[#FFA500] text-[10px] sm:text-[11px] uppercase tracking-widest font-mono rounded font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500]" />
                {isStudMode ? 'STUD IN PROXIMITY' : 'ELEVATED FLUX'}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2A2D35]/40 border border-[#2A2D35] text-[#6A6E7A] text-[10px] uppercase tracking-widest font-mono rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6A6E7A]" />
                LOW BACKGROUND FIELD
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
