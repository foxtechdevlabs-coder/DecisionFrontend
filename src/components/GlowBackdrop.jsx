export default function GlowBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-fox-mist" />
      <div className="absolute inset-0 bg-fox-radial-glow opacity-70" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-fox-purple/20 blur-3xl motion-safe:animate-aurora-blob-a motion-reduce:opacity-70" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-fox-violet/20 blur-3xl motion-safe:animate-aurora-blob-b motion-reduce:opacity-70" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B0764" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
