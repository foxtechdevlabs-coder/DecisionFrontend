import { useState } from "react";
import { Ticket, ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import { api } from "../api/client.js";

// Shared "enter your coupon code" front door for the decision wheel. The
// resulting token is kept in memory only (passed up via onValidated) — it
// is never written to storage, so the wheel has no persisted-session
// bypass and stays locked behind this gate on every visit.
export default function CouponEntry({ title, subtitle, onValidated }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter your coupon code.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.validateCoupon(trimmed);

      if (result?.success) {
        onValidated(result);
        return;
      }

      if (result?.alreadySpun) {
        setError(result.message || "This coupon has already been used.");
        return;
      }

      setError(result?.message || "Invalid coupon code.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-fox-violet/10 bg-white p-8 shadow-glow">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fox-gradient-soft">
        <Ticket size={28} weight="fill" className="text-fox-violet" />
      </div>
      <h2 className="text-center text-xl font-bold text-fox-ink">{title}</h2>
      <p className="mt-1 text-center text-sm text-fox-ink/60">{subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="e.g. FT7K2M"
          maxLength={12}
          className={`w-full rounded-xl border px-4 py-3 text-center text-lg font-bold tracking-[0.2em] outline-none transition focus:ring-2 focus:ring-fox-violet/40 ${
            error ? "border-red-400" : "border-fox-violet/15"
          }`}
        />
        {error && <p className="text-center text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-fox-gradient py-3.5 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? <SpinnerGap size={18} weight="bold" className="animate-spin" /> : null}
          {submitting ? "Checking..." : "Continue"}
          {!submitting && <ArrowRight size={17} weight="bold" />}
        </button>
      </form>
    </div>
  );
}
