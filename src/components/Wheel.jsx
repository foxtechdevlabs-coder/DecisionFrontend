import { motion } from "framer-motion";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 6;

function pointOnCircle(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  };
}

function segmentPath(startAngle, endAngle) {
  const start = pointOnCircle(startAngle, RADIUS);
  const end = pointOnCircle(endAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

// Percentage offers get the usual big "50%"; custom-text rewards ("Free
// Kit") wrap onto up to 2 short lines so they still fit inside a segment.
function segmentLines(segment) {
  if (segment.offerType !== "custom") return [`${segment.discountPercentage}%`];

  const words = segment.name.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 10 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === 2) break;
  }
  if (current && lines.length < 2) lines.push(current);
  if (lines.length === 2 && lines[1].length > 11) {
    lines[1] = `${lines[1].slice(0, 10)}…`;
  }
  return lines;
}

export default function Wheel({ segments, rotation, spinning, onRotationComplete, logoSrc }) {
  const segmentAngle = 360 / Math.max(segments.length, 1);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      {/* Pointer */}
      <div className="absolute left-1/2 top-[-14px] z-20 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-fox-deep drop-shadow-md" />
      </div>

      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-fox-gradient opacity-30 blur-2xl" />

      <motion.div
        className="relative rounded-full shadow-glow"
        style={{ width: SIZE, height: SIZE }}
        animate={{ rotate: rotation }}
        transition={{ duration: 4.2, ease: [0.13, 0.72, 0.14, 1] }}
        onAnimationComplete={onRotationComplete}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="rounded-full">
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 4} fill="#1E0B3D" />
          {segments.map((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            const midAngle = startAngle + segmentAngle / 2;
            const labelPoint = pointOnCircle(midAngle, RADIUS * 0.62);
            // Flip labels in the bottom half 180° so they never render upside-down.
            const labelRotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
            const lines = segmentLines(segment);
            const isCustom = segment.offerType === "custom";
            return (
              <g key={segment.id}>
                <path
                  d={segmentPath(startAngle, endAngle)}
                  fill={segment.color}
                  stroke="#FAF8FF"
                  strokeWidth="2"
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  fill="#FAF8FF"
                  fontSize={isCustom ? "10.5" : "15"}
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${labelRotation}, ${labelPoint.x}, ${labelPoint.y})`}
                >
                  {lines.map((line, i) => (
                    <tspan key={i} x={labelPoint.x} dy={i === 0 ? (lines.length > 1 ? "-0.4em" : 0) : "1.1em"}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.24} fill="#FAF8FF" stroke="#7C3AED" strokeWidth="3" />
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {logoSrc && (
            <img
              src={logoSrc}
              alt="FOXTECH"
              className={`h-12 w-12 rounded-full ${spinning ? "animate-pulse-glow" : ""}`}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
