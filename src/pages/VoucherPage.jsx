import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Medal, SpinnerGap, SealCheck } from "@phosphor-icons/react";
import { api } from "../api/client.js";
import GlowBackdrop from "../components/GlowBackdrop.jsx";
import ScratchCard from "../components/ScratchCard.jsx";
import logo from "../assets/foxtech-logo-full.jpg";

const TIER_COLORS = { SILVER: "#9CA3AF", GOLD: "#D4A017", PLATINUM: "#7C3AED" };

export default function VoucherPage() {
  const { code } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemState, setRedeemState] = useState("idle"); // idle | pending | done | error
  const [reward, setReward] = useState(null);
  const [revealedByScratch, setRevealedByScratch] = useState(false);

  useEffect(() => {
    api
      .getVoucher(code)
      .then((res) => {
        if (res?.success) {
          setVoucher(res.voucher);
          if (res.voucher.status === "REDEEMED") {
            setReward(res.voucher.rewardText);
            setRedeemState("done");
          }
        } else {
          setError(res?.message || "This voucher does not exist.");
        }
      })
      .catch(() => setError("Could not load this voucher. Please try again."))
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (voucher?.status !== "AVAILABLE" || redeemState !== "idle") return;
    setRedeemState("pending");
    api
      .redeemVoucher(code)
      .then((res) => {
        if (res?.success) {
          setReward(res.reward);
          setRedeemState("done");
        } else if (res?.alreadyRedeemed) {
          setReward(res.reward);
          setRedeemState("done");
        } else {
          setError(res?.message || "Unable to redeem this voucher right now.");
          setRedeemState("error");
        }
      })
      .catch((err) => {
        setError(err.message);
        setRedeemState("error");
      });
  }, [voucher, code, redeemState]);

  function handleScratchReveal() {
    setRevealedByScratch(true);
    if (reward) {
      const end = Date.now() + 1200;
      (function frame() {
        confetti({ particleCount: 5, spread: 70, origin: { y: 0.6 }, colors: ["#7C3AED", "#A855F7", "#3B0764"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }

  const tierColor = voucher ? TIER_COLORS[voucher.tier] || "#7C3AED" : "#7C3AED";
  const wasAlreadyRedeemedOnLoad = voucher?.status === "REDEEMED";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <GlowBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-fox-violet/10 bg-white p-8 text-center shadow-glow"
      >
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-fox-mist px-3 py-2">
          <img src={logo} alt="FOXTECH" className="h-6 w-auto" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-10 text-fox-ink/40">
            <SpinnerGap size={28} weight="bold" className="animate-spin" />
            Loading voucher...
          </div>
        ) : error ? (
          <p className="py-10 text-sm text-red-500">{error}</p>
        ) : (
          <>
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${tierColor}22` }}
            >
              <Medal size={24} weight="fill" style={{ color: tierColor }} />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: tierColor }}>
              {voucher.tier} Voucher
            </p>

            {wasAlreadyRedeemedOnLoad && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-fox-ink/50">
                <SealCheck size={14} weight="fill" />
                Already redeemed
              </p>
            )}

            <div className="mx-auto mt-5 flex justify-center">
              {wasAlreadyRedeemedOnLoad ? (
                <div className="flex h-[180px] w-[280px] flex-col items-center justify-center rounded-2xl bg-fox-gradient-soft px-4">
                  <p className="text-xs text-fox-ink/60">Your Reward</p>
                  <p className="mt-2 text-xl font-extrabold text-gradient">{reward}</p>
                </div>
              ) : (
                <ScratchCard width={280} height={180} onReveal={handleScratchReveal}>
                  {redeemState === "pending" || !reward ? (
                    <div className="flex flex-col items-center gap-2 text-fox-ink/40">
                      <SpinnerGap size={22} weight="bold" className="animate-spin" />
                      <span className="text-xs">Revealing...</span>
                    </div>
                  ) : (
                    <div className="px-4 text-center">
                      <p className="text-xs text-fox-ink/60">Your Reward</p>
                      <p className="mt-2 text-xl font-extrabold text-gradient">{reward}</p>
                    </div>
                  )}
                </ScratchCard>
              )}
            </div>

            {!wasAlreadyRedeemedOnLoad && !revealedByScratch && (
              <p className="mt-4 text-xs text-fox-ink/50">Scratch the card above to reveal your reward.</p>
            )}
            {(revealedByScratch || wasAlreadyRedeemedOnLoad) && reward && (
              <p className="mt-4 text-sm font-semibold text-fox-ink">Congratulations! 🎉</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
