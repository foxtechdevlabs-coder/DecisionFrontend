import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Confetti, PaperPlaneTilt, ArrowRight, SealCheck } from "@phosphor-icons/react";

export default function ResultModal({ offer, onClose, alreadySpun, participantName }) {
  useEffect(() => {
    if (!offer || alreadySpun) return;
    const duration = 1600;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.6 },
        colors: ["#7C3AED", "#A855F7", "#3B0764"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 },
        colors: ["#7C3AED", "#A855F7", "#3B0764"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [offer]);

  const isCustom = offer?.offerType === "custom";
  const rewardLabel = offer ? (isCustom ? offer.name : `${offer.discountPercentage}% Discount`) : "";
  const firstName = participantName ? participantName.trim().split(/\s+/)[0] : "";

  return (
    <AnimatePresence>
      {offer && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-fox-ink/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-glow"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-fox-gradient" />

            <div
              className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                alreadySpun ? "bg-fox-ink/5" : "bg-fox-gradient-soft"
              }`}
            >
              {alreadySpun ? (
                <SealCheck size={28} weight="fill" className="text-fox-ink/40" />
              ) : (
                <Confetti size={28} weight="fill" className="text-fox-violet" />
              )}
            </div>

            {!alreadySpun && (
              <p className="text-sm font-semibold uppercase tracking-wide text-fox-violet">
                Congratulations{firstName ? `, ${firstName}` : ""}!
              </p>
            )}
            {alreadySpun && (
              <p className="text-sm font-semibold uppercase tracking-wide text-fox-ink/50">
                Already participated
              </p>
            )}

            <p className="mt-2 text-sm text-fox-ink/60">
              {alreadySpun ? "You've already unlocked" : "You've unlocked"}
            </p>
            {isCustom ? (
              <p className="mt-1 text-4xl font-extrabold leading-tight text-gradient">{offer.name}</p>
            ) : (
              <p className="mt-1 text-5xl font-extrabold text-gradient">{offer.discountPercentage}% OFF</p>
            )}
            <p className="mt-2 text-sm text-fox-ink/60">
              {isCustom ? "as your exclusive FOXTECH reward." : "on selected FOXTECH courses."}
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="tel:+910000000000"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-fox-gradient py-3.5 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.99]"
              >
                <PaperPlaneTilt size={18} weight="bold" />
                Enquire About {rewardLabel}
              </a>
              <button
                onClick={onClose}
                className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-fox-violet transition hover:gap-2.5"
              >
                Explore Courses
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
