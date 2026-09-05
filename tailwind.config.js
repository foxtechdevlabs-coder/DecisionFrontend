/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fox: {
          violet: "#7C3AED",
          purple: "#A855F7",
          deep: "#3B0764",
          deeper: "#1E0B3D",
          ink: "#0B0A12",
          mist: "#FAF8FF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "fox-gradient": "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #3B0764 100%)",
        "fox-gradient-soft": "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(168,85,247,0.08) 100%)",
        "fox-radial-glow": "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.35), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124,58,237,0.55)",
        "glow-sm": "0 0 20px -6px rgba(124,58,237,0.45)",
        card: "0 4px 24px -4px rgba(20,10,40,0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Combined transform+opacity in one keyframe — separate animate-*
        // utilities can't be layered since they'd both set `animation`.
        "aurora-blob-a": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: 0.6 },
          "33%": { transform: "translate(4%, 6%) scale(1.08)", opacity: 1 },
          "66%": { transform: "translate(-3%, -4%) scale(0.96)", opacity: 0.75 },
        },
        "aurora-blob-b": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: 0.55 },
          "40%": { transform: "translate(-5%, -3%) scale(0.94)", opacity: 0.95 },
          "70%": { transform: "translate(3%, 5%) scale(1.06)", opacity: 0.7 },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "aurora-blob-a": "aurora-blob-a 14s ease-in-out infinite",
        "aurora-blob-b": "aurora-blob-b 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
