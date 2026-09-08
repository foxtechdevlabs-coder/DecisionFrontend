import { useEffect, useRef, useState } from "react";

// Canvas-based scratch-to-reveal. Draws a solid foil layer, then erases it
// along the pointer path with destination-out compositing; once enough of
// the canvas is cleared it fades out entirely and fires onReveal once.
export default function ScratchCard({ width = 280, height = 180, onReveal, children }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const revealed = useRef(false);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#A855F7");
    gradient.addColorStop(1, "#4C1D95");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#FAF8FF";
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to reveal", width / 2, height / 2);
  }, [width, height]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: ((point.clientX - rect.left) / rect.width) * width,
      y: ((point.clientY - rect.top) / rect.height) * height,
    };
  }

  function scratchAt(x, y) {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkCleared() {
    if (revealed.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { data } = ctx.getImageData(0, 0, width, height);
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4 * 8) {
      // sample every 8th pixel's alpha channel — plenty accurate, much cheaper
      if (data[i] === 0) cleared++;
    }
    const total = data.length / (4 * 8);
    if (cleared / total > 0.45) {
      revealed.current = true;
      setFaded(true);
      onReveal?.();
    }
  }

  function handleStart(e) {
    isDrawing.current = true;
    const { x, y } = getPos(e);
    scratchAt(x, y);
  }
  function handleMove(e) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    scratchAt(x, y);
  }
  function handleEnd() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    checkCleared();
  }

  return (
    <div ref={containerRef} className="relative select-none" style={{ width, height }}>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white">{children}</div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
          faded ? "pointer-events-none opacity-0" : "cursor-grab opacity-100 active:cursor-grabbing"
        }`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
